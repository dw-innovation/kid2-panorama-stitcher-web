<script lang="ts">
	import { appState } from '$src/lib/stores/state.svelte';
	import Modal from '../Modal.svelte';

	let modal: Modal;

	export const toggle = (open?: boolean) => modal?.toggle(open);
</script>

<Modal bind:this={modal} compact>
	<div class="prose prose-sm max-w-none">
		<h1 class="mb-4 text-2xl font-bold">Legal & Privacy Statement</h1>

		<p class="mb-4">
			We strongly support the right to privacy. The Privacy Policy below explains all details on the
			anonymous user data we would like to process to learn from your usage of this application.
			Manage your consent to anonymous analytics on our site here:
		</p>
		<label>
			<input
				type="checkbox"
				onchange={() => appState.toggle('tracking')}
				checked={appState.getConsent('tracking')}
			/>
			<span>anonymized tracking</span>
		</label>

		<h2 class="mt-6 mb-3 text-xl font-semibold">Legal Notice</h2>

		<div class="mb-4 text-sm">
			<p>Deutsche Welle | DW</p>
			<p>represented by the Director General Peter Limbourg</p>
			<p>Kurt-Schumacher-Str. 3 53113 Bonn</p>
			<p>
				Phone: 0049 228 429-0 E-Mail: <a href="mailto:info@dw.com" class="text-blue-600 underline"
					>info@dw.com</a
				>
			</p>
			<p>VAT ID: DE123052407</p>
		</div>

		<h2 class="mt-6 mb-3 text-xl font-semibold">Privacy Policy</h2>

		<p>
			We'll process your personal data exclusively within the legal framework of the data protection
			provisions of the European Union, particularly the General Data Protection Regulation
			(hereinafter: GDPR).
		</p>

		<p>
			This data protection policy statement describes when, how and for which purposes we'll process
			your personal data. It also points out the rights you have regarding the processing of your
			data. In particular, you'll find information on
		</p>

		<ul>
			<li>who's legally responsible for the data processing (data controller)</li>
			<li>the data collection and logging we carry out automatically when you visit our website</li>
			<li>
				the web analytics tool (e.g. Matomo) we've chosen to analyze and optimize usage of our
				website
			</li>
			<li>your rights as a data subject</li>
			<li>your right to lodge a complaint</li>
		</ul>

		<h3>1. Responsible data controller</h3>

		<p>You can contact DW's data protection officer and data protection supervision at:</p>

		<p>
			Deutsche Welle<br />
			Kurt-Schumacher-Strasse 3<br />
			53113 Bonn<br />
			T. +49.228.429-0
		</p>

		<p><a href="mailto:datenschutz@dw.com">datenschutz@dw.com</a></p>

		<h3>2. Data collection and logging</h3>

		<p>When you access our website on your device, we process the following anonymized data:</p>

		<ul>
			<li>the date and time of access</li>
			<li>the duration of your visit</li>
			<li>your operating system</li>
			<li>the device you've used for access</li>
			<li>your browser type (and version)</li>
			<li>the referrer (name of the website you accessed immediately before)</li>
			<li>the volume of data sent</li>
			<li>your anonymized IP address</li>
		</ul>

		<p>
			We process this data on the basis of GDPR Article 6 (1) point f (legitimate interest), as they
			are required for us to provide the service, ensure technical operation, and investigate/remove
			malfunctions. It's in our interest to ensure the use and technical operability of our website.
			This data is automatically processed when our website is accessed. We usually erase the data
			after 30 days unless, under exceptional circumstances, we need them for a longer period for
			the above-mentioned purposes. In such a case, we erase the data as soon as they're no longer
			required.
		</p>

		<h3>3. Web analytics (Matomo)</h3>

		<p>
			This website uses Matomo web analytics and makes use of cookieless tracking. Cookieless
			tracking is an alternative form of tracking that uses methods such as counting the number of
			unique, anonymised IP addresses or browser fingerprinting to identify users instead of
			cookies. This means that this website can still provide a smooth interaction and be analysed
			and improved based on the tracking of users without having to bother you with cookies. More
			information can be found here.
		</p>

		<h3>4. Your rights as a data subject</h3>

		<p>
			We do not store any non-anonymized data. However, as a data subject you are generally entitled
			to the following rights:
		</p>

		<ul>
			<li>
				right to information: You have a right to access the data we've stored about you as a
				person.
			</li>
			<li>
				right to rectification and erasure: You can require us to correct inaccurate data or –
				provided that the legal grounds are in place – to erase your data.
			</li>
			<li>
				restriction of processing: Provided that the legal grounds are in place, you can require us
				to restrict the processing of your data.
			</li>
			<li>
				data portability: If you've provided us with data on the basis of a contract or your
				consent, and as long as there are legal grounds, you can require us to send you the data you
				gave us in a structured, commonly used and machine-readable format, or you can require us to
				send your data to a different controller.
			</li>
			<li>
				objection to data processing on the legal basis of "legitimate interest" under GDPR Article
				6 (1) point f: If there are reasons arising from your specific situation, you are entitled
				to object to our processing of your data at any time, provided that such an objection has
				its legal basis in a "legitimate interest". If you make use of your right to object, we
				shall discontinue the processing of your data, unless we can – within the parameters of the
				law – demonstrate compelling legitimate grounds for further processing, outweighing your own
				rights.
			</li>
			<li>objection to cookies: You can also object to the use of cookies at any time.</li>
			<li>
				revocation of consent: If you've given us your consent to the processing of your data, you
				can revoke the same at any time with future effect. This, however, doesn't affect the
				legitimacy of processing your data until the date of revocation.
			</li>
		</ul>

		<p>
			To exercise any of the aforementioned rights, please use the contact details as provided in
			clause 1 of this data protection policy. When you do so, please make sure we can clearly
			identify you. If you have any questions about the processing of your personal data, your
			rights as a data subject or any consent you may have given, please feel free to contact us.
			We'll provide further information, free of any charges.
		</p>

		<h3 class="mt-6 mb-2 text-lg font-medium">5. Your right to lodge a complaint</h3>

		<p class="mb-4">
			Without prejudice to any other administrative or judicial remedy, you have the right to lodge
			a complaint with a supervisory authority, in particular in the Member State of your habitual
			residence, place of work, or place of the alleged infringement if you consider that the
			processing of personal data relating to you infringes the GDPR.
		</p>
	</div>
</Modal>
