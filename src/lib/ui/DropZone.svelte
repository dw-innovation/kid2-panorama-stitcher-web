<script lang="ts">
	import type { Snippet } from 'svelte';

	interface FileValidationError {
		code: 'FILE_TOO_LARGE' | 'FILE_TOO_SMALL' | 'INVALID_TYPE' | 'TOO_MANY_FILES' | 'CUSTOM_ERROR';
		message: string;
		file?: File;
	}

	interface Props {
		// Core functionality
		onDrop?: (files: File[]) => void | Promise<void>;
		onError?: (errors: FileValidationError[]) => void;
		onFileValidation?: (file: File) => boolean | string;

		// File constraints
		accept?: string;
		maxSize?: number; // bytes
		minSize?: number; // bytes
		maxFiles?: number;
		multiple?: boolean;
		disabled?: boolean;

		// Visual customization
		class?: string;
		activeClass?: string;
		acceptClass?: string;
		rejectClass?: string;
		disabledClass?: string;

		// Content
		children?: Snippet<
			[{ isDragActive: boolean; isDragAccept: boolean; isDragReject: boolean; disabled: boolean }]
		>;

		// Behavior
		preventDropOnDocument?: boolean;
		noClick?: boolean;
		noKeyboard?: boolean;
		noDrag?: boolean;
	}

	let {
		onDrop,
		onError,
		onFileValidation,
		accept = '.png,.jpg,.jpeg,.mp4,.webm,.mov',
		maxSize = 100 * 1024 * 1024, // 100MB
		minSize = 0,
		maxFiles = 10,
		multiple = true,
		disabled = false,
		class: className = '',
		activeClass = 'border-blue-500 bg-blue-50',
		acceptClass = 'border-green-500 bg-green-50',
		rejectClass = 'border-red-500 bg-red-50',
		disabledClass = 'opacity-50 cursor-not-allowed',
		children,
		preventDropOnDocument = true,
		noClick = false,
		noKeyboard = false,
		noDrag = false
	}: Props = $props();

	let dropZoneElement: HTMLDivElement;
	let fileInputElement: HTMLInputElement;

	let isDragActive = $state(false);
	let isDragAccept = $state(false);
	let isDragReject = $state(false);
	let dragCounter = $state(0);

	// Parse accept string to create file type validation
	const acceptedTypes = $derived(() => {
		if (!accept) return [];
		return accept.split(',').map((type) => type.trim().toLowerCase());
	});

	const acceptedMimeTypes = $derived(() => {
		const mimeMap: Record<string, string[]> = {
			'.png': ['image/png'],
			'.jpg': ['image/jpeg'],
			'.jpeg': ['image/jpeg'],
			'.mp4': ['video/mp4'],
			'.webm': ['video/webm'],
			'.mov': ['video/quicktime']
		};

		return acceptedTypes().flatMap((ext: string) => mimeMap[ext] || []);
	});

	// File validation
	function validateFile(file: File): FileValidationError | null {
		// Size validation
		if (file.size > maxSize) {
			return {
				code: 'FILE_TOO_LARGE',
				message: `File size exceeds ${formatFileSize(maxSize)}`,
				file
			};
		}

		if (file.size < minSize) {
			return {
				code: 'FILE_TOO_SMALL',
				message: `File size is below ${formatFileSize(minSize)}`,
				file
			};
		}

		// Type validation
		const fileName = file.name.toLowerCase();
		const isValidExtension = acceptedTypes().some((type: string) => fileName.endsWith(type));
		const isValidMimeType =
			acceptedMimeTypes().length === 0 || acceptedMimeTypes().includes(file.type);

		if (!isValidExtension && !isValidMimeType) {
			return {
				code: 'INVALID_TYPE',
				message: `File type not accepted. Accepted types: ${accept}`,
				file
			};
		}

		// Custom validation
		if (onFileValidation) {
			const result = onFileValidation(file);
			if (result !== true) {
				return {
					code: 'CUSTOM_ERROR',
					message: typeof result === 'string' ? result : 'File validation failed',
					file
				};
			}
		}

		return null;
	}

	function validateFiles(files: File[]): { validFiles: File[]; errors: FileValidationError[] } {
		const errors: FileValidationError[] = [];
		const validFiles: File[] = [];

		// Check file count
		if (files.length > maxFiles) {
			errors.push({
				code: 'TOO_MANY_FILES',
				message: `Too many files. Maximum allowed: ${maxFiles}`
			});
			return { validFiles: [], errors };
		}

		// Validate each file
		for (const file of files) {
			const error = validateFile(file);
			if (error) {
				errors.push(error);
			} else {
				validFiles.push(file);
			}
		}

		return { validFiles, errors };
	}

	function formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}

	// Event handlers
	function handleDragEnter(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();

		if (disabled || noDrag) return;

		dragCounter++;

		if (e.dataTransfer?.items) {
			const files = Array.from(e.dataTransfer.items)
				.filter((item) => item.kind === 'file')
				.map((item) => item.getAsFile())
				.filter(Boolean) as File[];

			const { errors } = validateFiles(files);
			isDragActive = true;
			isDragAccept = errors.length === 0;
			isDragReject = errors.length > 0;
		}
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();

		if (disabled || noDrag) return;

		// Set dropEffect for visual feedback
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = isDragAccept ? 'copy' : 'none';
		}
	}

	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();

		if (disabled || noDrag) return;

		dragCounter--;

		if (dragCounter === 0) {
			isDragActive = false;
			isDragAccept = false;
			isDragReject = false;
		}
	}

	async function handleDrop(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();

		if (disabled || noDrag) return;

		dragCounter = 0;
		isDragActive = false;
		isDragAccept = false;
		isDragReject = false;

		const files = Array.from(e.dataTransfer?.files || []);
		await processFiles(files);
	}

	async function handleFileInput(e: Event) {
		const input = e.target as HTMLInputElement;
		const files = Array.from(input.files || []);
		await processFiles(files);

		// Reset input value to allow selecting the same file again
		input.value = '';
	}

	async function processFiles(files: File[]) {
		if (files.length === 0) return;

		// Limit files if not multiple
		const filesToProcess = multiple ? files : files.slice(0, 1);

		const { validFiles, errors } = validateFiles(filesToProcess);

		if (errors.length > 0 && onError) {
			onError(errors);
		}

		if (validFiles.length > 0 && onDrop) {
			await onDrop(validFiles);
		}
	}

	function handleClick() {
		if (disabled || noClick) return;
		fileInputElement?.click();
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (disabled || noKeyboard) return;

		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleClick();
		}
	}

	// Prevent drops on document if requested
	$effect(() => {
		if (!preventDropOnDocument) return;

		const handleDocumentDragOver = (e: DragEvent) => {
			e.preventDefault();
		};

		const handleDocumentDrop = (e: DragEvent) => {
			e.preventDefault();
		};

		document.addEventListener('dragover', handleDocumentDragOver);
		document.addEventListener('drop', handleDocumentDrop);

		return () => {
			document.removeEventListener('dragover', handleDocumentDragOver);
			document.removeEventListener('drop', handleDocumentDrop);
		};
	});

	// Computed classes
	const computedClass = $derived(() => {
		const classes = [
			'dropzone',
			className,
			disabled ? disabledClass : '',
			isDragActive ? activeClass : '',
			isDragAccept ? acceptClass : '',
			isDragReject ? rejectClass : ''
		].filter(Boolean);

		return classes.join(' ');
	});
</script>

<div
	bind:this={dropZoneElement}
	class={computedClass()}
	role="button"
	tabindex={disabled || noKeyboard ? -1 : 0}
	aria-label="File drop zone. Click or drag files here to upload."
	aria-disabled={disabled}
	ondragenter={handleDragEnter}
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	ondrop={handleDrop}
	onclick={handleClick}
	onkeydown={handleKeyDown}
>
	<input
		bind:this={fileInputElement}
		type="file"
		{accept}
		{multiple}
		{disabled}
		style="display: none;"
		onchange={handleFileInput}
		aria-hidden="true"
	/>

	{#if children}
		{@render children({ isDragActive, isDragAccept, isDragReject, disabled })}
	{/if}
</div>

<style>
	@reference "$src/app.css";

	.dropzone {
		@apply cursor-pointer rounded-lg border-2 border-dashed border-gray-300 bg-blue-100 p-6 transition-all duration-200 ease-in-out;
	}

	.dropzone:hover:not([aria-disabled='true']) {
		@apply border-gray-400 bg-blue-200;
	}

	.dropzone:focus {
		@apply outline-none;
	}
</style>
