import { useEffect, useMemo, useRef, useState } from 'react';
import { uploadChatImages } from '../../services/chatApi';

function fmt(ts) {
	const d = new Date(ts);
	return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function isImage(type = '') {
	return /^image\//i.test(type);
}

function fileIcon(type = '') {
	if (/pdf$/i.test(type)) return '📄';
	if (/word|officedocument\.word/i.test(type)) return '📝';
	if (/sheet|excel|spreadsheet/i.test(type)) return '📊';
	if (/text\/plain/i.test(type)) return '📃';
	return '📎';
}

export default function ChatModal({
	isOpen,
	onClose,
	partnerName,
	topicName,
	currentUserId, // UWAGA: tu spodziewamy się emaila z małych liter
	messages,
	onSend, // (text, attachments)
	showTyping = false,
}) {
	const [text, setText] = useState('');
	const [otherTyping, setOtherTyping] = useState(false);

	const [pending, setPending] = useState([]);
	const fileInputRef = useRef(null);

	const listRef = useRef(null);
	const taRef = useRef(null);

	const [linkToOpen, setLinkToOpen] = useState(null);

	const sorted = useMemo(
		() =>
			[...(messages || [])].sort(
				(a, b) => new Date(a.createdAt) - new Date(b.createdAt)
			),
		[messages]
	);

	const withSeps = useMemo(() => {
		const out = [];
		let last = 0;
		for (const m of sorted) {
			const t = new Date(m.createdAt).getTime();
			if (last !== 0 && t - last > 10 * 60 * 1000)
				out.push({ type: 'sep', at: m.createdAt });
			out.push({ type: 'msg', m });
			last = t;
		}
		return out;
	}, [sorted]);

	useEffect(() => {
		if (!isOpen) return;
		const el = listRef.current;
		if (el) el.scrollTop = el.scrollHeight;
		setTimeout(() => taRef.current?.focus(), 0);
	}, [isOpen, withSeps.length, pending.length]);

	function openFilePicker() {
		fileInputRef.current?.click();
	}

	async function handleFilesSelected(e) {
		const files = Array.from(e.target.files || []);
		if (!files.length) return;

		const imageFiles = files.filter((f) =>
			f.type?.toLowerCase().startsWith('image/')
		);

		if (imageFiles.length === 0) {
			e.target.value = '';
			return;
		}

		try {
			const uploaded = await uploadChatImages(imageFiles);
			setPending((prev) => [...prev, ...uploaded]);
		} catch (err) {
			console.error(err);
		} finally {
			e.target.value = '';
		}
	}

	function removePending(id) {
		setPending((prev) => prev.filter((p) => p.id !== id));
	}

	function openAttachment(att) {
		if (!att?.url) return;
		window.open(att.url, '_blank', 'noopener,noreferrer');
	}

	const canSend = text.trim().length > 0 || pending.length > 0;

	function handleSend() {
		if (!canSend) return;
		onSend(text.trim(), pending);
		setText('');
		setPending([]);

		if (showTyping) {
			setOtherTyping(true);
			setTimeout(() => setOtherTyping(false), 1200);
		}
	}

	// linki
	function requestOpenLink(url) {
		setLinkToOpen(url);
	}

	function handleLinkDecision(open) {
		if (open && linkToOpen) {
			window.open(linkToOpen, '_blank', 'noopener,noreferrer');
		}
		setLinkToOpen(null);
	}

	function renderTextWithLinks(text = '') {
		if (!text) return null;

		const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
		const parts = [];
		let lastIndex = 0;
		let match;

		while ((match = urlRegex.exec(text)) !== null) {
			const urlText = match[0];
			const start = match.index;

			if (start > lastIndex) {
				parts.push(text.slice(lastIndex, start));
			}

			let href = urlText;
			if (!/^https?:\/\//i.test(href)) {
				href = 'https://' + href;
			}

			parts.push(
				<button
					key={`${href}-${start}`}
					className='underline font-semibold'
					onClick={(e) => {
						e.stopPropagation();
						requestOpenLink(href);
					}}
				>
					{urlText}
				</button>
			);

			lastIndex = start + urlText.length;
		}

		if (lastIndex < text.length) {
			parts.push(text.slice(lastIndex));
		}

		return parts;
	}

	if (!isOpen) return null;

	return (
		<div
			className='fixed inset-0 z-[3000] bg-black/60 grid place-items-center'
			onClick={(e) => e.stopPropagation()}
			role='dialog'
			aria-modal='true'
		>
			<div
				className='w-full max-w-[720px] mx-6 h-[66vh] md:h-[66vh] bg-main text-text rounded-2xl shadow-[0_18px_44px_rgba(0,0,0,.55)] grid grid-rows-[auto_1fr_auto] overflow-hidden'
				onClick={(e) => e.stopPropagation()}
			>
				{/* HEADER */}
				<div className='flex items-center gap-2 bg-secondary px-3 py-2'>
					<button
						className='w-9 h-9 rounded-md grid place-items-center hover:bg-white/10 cursor-pointer'
						onClick={onClose}
						aria-label='Wstecz'
					>
						<svg viewBox='0 0 24 24' className='w-5 h-5'>
							<path
								d='M15 19l-7-7 7-7'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							/>
						</svg>
					</button>

					<div className='flex-1 min-w-0'>
						<div className='font-extrabold text-sm sm:text-base truncate'>
							Rozmowa z {partnerName}
						</div>
						<div className='text-xs text-accent truncate'>
							w sprawie:{' '}
							<span className='font-extrabold text-text'>{topicName}</span>
						</div>
					</div>

					<button
						className='px-2 py-1 text-cta font-extrabold text-lg rounded-md hover:bg-cta/15 cursor-pointer'
						onClick={onClose}
						aria-label='Zamknij'
					>
						X
					</button>
				</div>

				<div className='h-[1px] bg-white/10' />

				{/* WIADOMOŚCI */}
				<div ref={listRef} className='bg-[#1b1b1b] overflow-y-auto px-4 py-3'>
					{withSeps.length === 0 && (
						<div className='text-center text-accent text-sm py-4'>
							Napisz pierwszą wiadomość…
						</div>
					)}

					{withSeps.map((it, i) => {
						if (it.type === 'sep') {
							return (
								<div
									key={`sep-${i}`}
									className='text-xs text-accent border border-white/15 rounded-full px-2 py-1 w-fit mx-auto my-2'
								>
									{new Date(it.at).toLocaleString()}
								</div>
							);
						}
						const m = it.m;

						// KLUCZOWE: porównujemy już znormalizowane maile
						const mine =
							(m.senderId || '').toLowerCase() ===
							(currentUserId || '').toLowerCase();

						return (
							<div
								key={m.id}
								className={`flex my-2 ${
									mine ? 'justify-end' : 'justify-start'
								}`}
								title={fmt(m.createdAt)}
							>
								<div
									className={`max-w-[78%] px-3 py-2 rounded-2xl whitespace-pre-wrap break-words text-sm leading-relaxed ${
										mine
											? 'bg-cta text-main rounded-br-md'
											: 'bg-user-options-fill text-text rounded-bl-md'
									}`}
								>
									{renderTextWithLinks(m.text)}

									{!!m.attachments?.length && (
										<div className='flex flex-col gap-2 mt-2'>
											{m.attachments.map((a) => (
												<div
													key={a.id}
													className='inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 rounded-lg px-2 py-1 cursor-pointer'
													onClick={() => openAttachment(a)}
													title={`Otwórz: ${a.name}`}
													role='button'
												>
													{isImage(a.type) ? (
														<img
															src={a.url}
															alt={a.name}
															className='w-10 h-10 object-cover rounded-md bg-black'
														/>
													) : (
														<span className='text-base'>
															{fileIcon(a.type)}
														</span>
													)}
													<span className='text-xs max-w-[220px] truncate'>
														{a.name}
													</span>
												</div>
											))}
										</div>
									)}
								</div>
							</div>
						);
					})}

					{showTyping && otherTyping && (
						<div className='flex my-2 justify-start'>
							<div className='max-w-[78%] px-3 py-2 rounded-2xl bg-user-options-fill rounded-bl-md'>
								<span className='inline-flex items-center gap-1'>
									<i className='w-1.5 h-1.5 rounded-full bg-white/90 animate-bounce [animation-delay:-.2s]' />
									<i className='w-1.5 h-1.5 rounded-full bg-white/90 animate-bounce' />
									<i className='w-1.5 h-1.5 rounded-full bg-white/90 animate-bounce [animation-delay:.2s]' />
								</span>
							</div>
						</div>
					)}
				</div>

				{/* PENDING ZAŁĄCZNIKI */}
				{pending.length > 0 && (
					<div className='bg-secondary border-y border-white/10 px-3 py-2 flex flex-wrap gap-2'>
						{pending.map((a) => (
							<div
								key={a.id}
								className='inline-flex items-center gap-2 bg-white/10 rounded-lg px-2 py-1'
							>
								{isImage(a.type) ? (
									<img
										src={a.url}
										alt={a.name}
										className='w-10 h-10 object-cover rounded-md bg-black cursor-pointer'
										onClick={() => openAttachment(a)}
									/>
								) : (
									<span
										className='text-base cursor-pointer'
										onClick={() => openAttachment(a)}
									>
										{fileIcon(a.type)}
									</span>
								)}
								<span
									className='text-xs max-w-[220px] truncate cursor-pointer'
									onClick={() => openAttachment(a)}
								>
									{a.name}
								</span>
								<button
									className='ml-1 text-base leading-none hover:opacity-100 opacity-80'
									onClick={() => removePending(a.id)}
									title='Usuń'
								>
									×
								</button>
							</div>
						))}
					</div>
				)}

				{/* INPUT BAR */}
				<div className='bg-secondary border-t border-white/10 px-3 py-2 flex items-end gap-2'>
					<textarea
						ref={taRef}
						className='flex-1 max-h-[140px] min-h-[44px] resize-none bg-user-options-fill text-text rounded-xl px-3 py-2 outline-none border border-transparent focus:border-cta leading-relaxed placeholder:text-accent'
						placeholder='Wpisz wiadomość...'
						rows={1}
						value={text}
						onChange={(e) => {
							setText(e.target.value);
							const ta = e.currentTarget;
							ta.style.height = 'auto';
							ta.style.height = Math.min(140, ta.scrollHeight) + 'px';
						}}
						onKeyDown={(e) => {
							if (e.key === 'Enter' && !e.shiftKey) {
								e.preventDefault();
								handleSend();
							}
						}}
					/>

					<div className='flex items-center gap-2'>
						<button
							className='w-10 h-10 rounded-full grid place-items-center bg-cta text-main font-extrabold disabled:opacity-60 cursor-pointer disabled:cursor-auto'
							onClick={handleSend}
							title='Wyślij'
							aria-label='Wyślij'
							disabled={!canSend}
						>
							<svg viewBox='0 0 24 24' className='w-5 h-5'>
								<path
									d='M22 2L11 13'
									fill='none'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
								/>
								<path d='M22 2l-7 20-4-9-9-4 20-7z' fill='currentColor' />
							</svg>
						</button>

						<button
							className='w-10 h-10 rounded-full grid place-items-center bg-cta text-main font-extrabold cursor-pointer'
							onClick={openFilePicker}
							title='Załącz zdjęcie'
							aria-label='Załącz zdjęcie'
						>
							<svg viewBox='0 0 24 24' className='w-5 h-5'>
								<path
									d='M16.5 6.5l-7.78 7.78a3 3 0 104.24 4.24l8.13-8.13a5 5 0 10-7.07-7.07L5.9 10.44'
									fill='none'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
								/>
							</svg>
						</button>

						<input
							ref={fileInputRef}
							type='file'
							multiple
							className='hidden'
							onChange={handleFilesSelected}
							accept='image/*'
						/>
					</div>
				</div>
			</div>

			{/* POPUP z ostrzeżeniem o linku */}
			{linkToOpen && (
				<div className='fixed inset-0 z-[3100] bg-black/60 flex items-center justify-center'>
					<div className='bg-main text-text rounded-2xl p-4 max-w-sm w-[90%] shadow-[0_12px_30px_rgba(0,0,0,.6)] border border-white/10'>
						<h3 className='font-bold text-lg mb-2'>
							Otwierasz zewnętrzny link
						</h3>
						<p className='text-sm mb-3'>
							Podany link nie jest zweryfikowany przez naszą stronę. Wchodzisz
							na własne ryzyko.
						</p>
						<p className='text-xs break-all text-accent mb-4'>{linkToOpen}</p>

						<div className='flex justify-end gap-2'>
							<button
								className='px-3 py-1 rounded-lg bg-user-options-fill text-sm hover:bg-black/40'
								onClick={() => handleLinkDecision(false)}
							>
								Anuluj
							</button>
							<button
								className='px-3 py-1 rounded-lg bg-cta text-main text-sm font-bold hover:bg-cta/80'
								onClick={() => handleLinkDecision(true)}
							>
								Otwórz
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
