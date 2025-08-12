
interface TooltipOptions {
	content?: string;
	placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
	offset?: number;
	delay?: number;
	maxWidth?: number;
}

interface TooltipState {
	element: HTMLElement;
	tooltip: HTMLDivElement | null;
	title: string | null;
	showTimeout: ReturnType<typeof setTimeout> | null;
	hideTimeout: ReturnType<typeof setTimeout> | null;
	options: Required<TooltipOptions>;
	isVisible: boolean;
}

const defaultOptions: Required<TooltipOptions> = {
	content: '',
	placement: 'auto',
	offset: 8,
	delay: 100,
	maxWidth: 300
};

export function tooltip(element: HTMLElement, options: TooltipOptions = {}) {
	const state: TooltipState = {
		element,
		tooltip: null,
		title: null,
		showTimeout: null,
		hideTimeout: null,
		options: { ...defaultOptions, ...options },
		isVisible: false
	};

	function getTooltipContent(): string {
		return state.options.content || state.title || '';
	}

	function createTooltip(): HTMLDivElement {
		const tooltip = document.createElement('div');
		tooltip.className = 'custom-tooltip';
		tooltip.style.cssText = `
			position: absolute;
			z-index: 10000;
			max-width: ${state.options.maxWidth}px;
			padding: 8px 12px;
			background: #1a1a1a;
			color: white;
			border-radius: 6px;
			font-size: 12px;
			line-height: 1.4;
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
			pointer-events: none;
			opacity: 0;
			transform: scale(0.95);
			transition: opacity 150ms ease-out, transform 150ms ease-out;
			word-wrap: break-word;
			white-space: pre-wrap;
		`;

		const arrow = document.createElement('div');
		arrow.className = 'tooltip-arrow';
		arrow.style.cssText = `
			position: absolute;
			width: 8px;
			height: 8px;
			background: #1a1a1a;
			transform: rotate(45deg);
		`;

		tooltip.appendChild(arrow);
		return tooltip;
	}

	function getOptimalPlacement(
		elementRect: DOMRect,
		tooltipRect: DOMRect,
		preferredPlacement: string
	): string {
		const viewport = {
			width: window.innerWidth,
			height: window.innerHeight,
			scrollX: window.scrollX,
			scrollY: window.scrollY
		};

		const space = {
			top: elementRect.top - viewport.scrollY,
			bottom: viewport.height - (elementRect.bottom - viewport.scrollY),
			left: elementRect.left - viewport.scrollX,
			right: viewport.width - (elementRect.right - viewport.scrollX)
		};

		// If preferred placement fits, use it
		if (preferredPlacement !== 'auto') {
			const hasSpace = {
				top: space.top >= tooltipRect.height + state.options.offset,
				bottom: space.bottom >= tooltipRect.height + state.options.offset,
				left: space.left >= tooltipRect.width + state.options.offset,
				right: space.right >= tooltipRect.width + state.options.offset
			};

			if (hasSpace[preferredPlacement as keyof typeof hasSpace]) {
				return preferredPlacement;
			}
		}

		// Find best placement based on available space
		const placements = [
			{ name: 'top', space: space.top, size: tooltipRect.height },
			{ name: 'bottom', space: space.bottom, size: tooltipRect.height },
			{ name: 'left', space: space.left, size: tooltipRect.width },
			{ name: 'right', space: space.right, size: tooltipRect.width }
		];

		return placements
			.filter(p => p.space >= p.size + state.options.offset)
			.sort((a, b) => b.space - a.space)[0]?.name || 'bottom';
	}

	function positionTooltip(tooltip: HTMLDivElement): void {
		const elementRect = state.element.getBoundingClientRect();
		
		// Create temporary tooltip to measure dimensions
		tooltip.style.opacity = '0';
		tooltip.style.visibility = 'hidden';
		document.body.appendChild(tooltip);
		
		const tooltipRect = tooltip.getBoundingClientRect();
		const placement = getOptimalPlacement(elementRect, tooltipRect, state.options.placement);
		
		let left = 0;
		let top = 0;
		let arrowLeft = '50%';
		let arrowTop = '50%';
		let arrowTransform = 'rotate(45deg)';

		const offset = state.options.offset;
		const scrollX = window.scrollX;
		const scrollY = window.scrollY;

		switch (placement) {
			case 'top':
				left = elementRect.left + scrollX + (elementRect.width - tooltipRect.width) / 2;
				top = elementRect.top + scrollY - tooltipRect.height - offset;
				arrowLeft = '50%';
				arrowTop = '100%';
				arrowTransform = 'translate(-50%, -50%) rotate(45deg)';
				break;

			case 'bottom':
				left = elementRect.left + scrollX + (elementRect.width - tooltipRect.width) / 2;
				top = elementRect.bottom + scrollY + offset;
				arrowLeft = '50%';
				arrowTop = '0%';
				arrowTransform = 'translate(-50%, -50%) rotate(45deg)';
				break;

			case 'left':
				left = elementRect.left + scrollX - tooltipRect.width - offset;
				top = elementRect.top + scrollY + (elementRect.height - tooltipRect.height) / 2;
				arrowLeft = '100%';
				arrowTop = '50%';
				arrowTransform = 'translate(-50%, -50%) rotate(45deg)';
				break;

			case 'right':
				left = elementRect.right + scrollX + offset;
				top = elementRect.top + scrollY + (elementRect.height - tooltipRect.height) / 2;
				arrowLeft = '0%';
				arrowTop = '50%';
				arrowTransform = 'translate(-50%, -50%) rotate(45deg)';
				break;
		}

		// Ensure tooltip stays within viewport bounds
		const viewport = {
			width: window.innerWidth,
			height: window.innerHeight
		};

		left = Math.max(8, Math.min(left, viewport.width - tooltipRect.width - 8));
		top = Math.max(8, Math.min(top, viewport.height - tooltipRect.height - 8));

		// Apply positioning
		tooltip.style.left = `${left}px`;
		tooltip.style.top = `${top}px`;
		tooltip.style.visibility = 'visible';

		// Position arrow
		const arrow = tooltip.querySelector('.tooltip-arrow') as HTMLDivElement;
		if (arrow) {
			arrow.style.left = arrowLeft;
			arrow.style.top = arrowTop;
			arrow.style.transform = arrowTransform;
		}
	}

	function showTooltip(): void {
		if (state.isVisible || !getTooltipContent().trim()) return;

		if (state.hideTimeout) {
			clearTimeout(state.hideTimeout);
			state.hideTimeout = null;
		}

		state.tooltip = createTooltip();
		state.tooltip.textContent = getTooltipContent();
		
		positionTooltip(state.tooltip);
		
		// Trigger animation
		requestAnimationFrame(() => {
			if (state.tooltip) {
				state.tooltip.style.opacity = '1';
				state.tooltip.style.transform = 'scale(1)';
			}
		});

		state.isVisible = true;
	}

	function hideTooltip(): void {
		if (!state.isVisible || !state.tooltip) return;

		if (state.showTimeout) {
			clearTimeout(state.showTimeout);
			state.showTimeout = null;
		}

		state.tooltip.style.opacity = '0';
		state.tooltip.style.transform = 'scale(0.95)';

		setTimeout(() => {
			if (state.tooltip && state.tooltip.parentNode) {
				state.tooltip.parentNode.removeChild(state.tooltip);
			}
			state.tooltip = null;
			state.isVisible = false;
		}, 150);
	}

	function handleMouseEnter(): void {
		if (state.hideTimeout) {
			clearTimeout(state.hideTimeout);
			state.hideTimeout = null;
		}

		// Store original title and remove it to prevent default tooltip
		state.title = state.element.getAttribute('title');
		if (state.title) {
			state.element.removeAttribute('title');
		}

		state.showTimeout = setTimeout(() => {
			showTooltip();
		}, state.options.delay);
	}

	function handleMouseLeave(): void {
		if (state.showTimeout) {
			clearTimeout(state.showTimeout);
			state.showTimeout = null;
		}

		// Restore original title
		if (state.title) {
			state.element.setAttribute('title', state.title);
			state.title = null;
		}

		state.hideTimeout = setTimeout(() => {
			hideTooltip();
		}, 50);
	}

	function handleFocus(): void {
		handleMouseEnter();
	}

	function handleBlur(): void {
		handleMouseLeave();
	}

	// Initialize
	state.element.addEventListener('mouseenter', handleMouseEnter);
	state.element.addEventListener('mouseleave', handleMouseLeave);
	state.element.addEventListener('focus', handleFocus);
	state.element.addEventListener('blur', handleBlur);

	return {
		update(newOptions: TooltipOptions = {}) {
			state.options = { ...defaultOptions, ...newOptions };
			
			// If content changed and tooltip is visible, update it
			if (state.isVisible && state.tooltip) {
				const newContent = getTooltipContent();
				if (newContent.trim()) {
					state.tooltip.textContent = newContent;
					positionTooltip(state.tooltip);
				} else {
					hideTooltip();
				}
			}
		},

		destroy() {
			if (state.showTimeout) clearTimeout(state.showTimeout);
			if (state.hideTimeout) clearTimeout(state.hideTimeout);
			
			state.element.removeEventListener('mouseenter', handleMouseEnter);
			state.element.removeEventListener('mouseleave', handleMouseLeave);
			state.element.removeEventListener('focus', handleFocus);
			state.element.removeEventListener('blur', handleBlur);

			if (state.tooltip && state.tooltip.parentNode) {
				state.tooltip.parentNode.removeChild(state.tooltip);
			}

			// Restore title if it was removed
			if (state.title) {
				state.element.setAttribute('title', state.title);
			}
		}
	};
}