//W celu stworzenia karuzeli obrazów używamy biblioteki Swiper.js
// Dokumentacja: https://swiperjs.com/react

// 1. Import Swipera i potrzebnych modułów
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';

// 2. Import bazowych stylów Swipera
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Zostawiłem komentarze w razie W jakby ktoś chciał się bardziej zaznajomić co jest 5
// Bo jest to jakiś zewnętrzny komponent z jakiejś biblioteki

const ImageCarousel = ({ images }) => {
	const displayImages =
		images && images.length > 0
			? images
			: [
					'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
			  ];
	return (
		// Główny kontener do wycentrowania karuzeli i umieszczenia nawigacji
		<div className='relative w-full max-w-2xl mx-auto border-b-2 border-accent pb-8'>
			<Swiper
				// 3. Włącz potrzebne moduły
				modules={[Navigation, Pagination, A11y]}
				spaceBetween={50}
				slidesPerView={1}
				loop={true}
				// 4. Konfiguracja niestandardowej nawigacji
				navigation={{
					nextEl: '.swiper-button-next-custom',
					prevEl: '.swiper-button-prev-custom',
				}}
				// 5. Konfiguracja paginacji
				pagination={{
					el: '.swiper-pagination-custom',
					clickable: true,
				}}
				className='rounded-2xl'
			>
				{displayImages.map((src, index) => (
					<SwiperSlide key={index}>
						<img
							src={src}
							alt={`Slide ${index + 1}`}
							className='block w-full h-full object-cover rounded-2xl aspect-[4/3]'
						/>
					</SwiperSlide>
				))}

				{/* 6. Dodajemy kontener dla paginacji na slajdzie */}
				<div className='absolute bottom-4 left-1/2 -translate-x-1/2 z-10'>
					<div className='swiper-pagination-custom'></div>
				</div>
			</Swiper>

			{/* 7. Tworzymy niestandardowe przyciski nawigacji */}
			<div className='swiper-button-prev-custom absolute top-1/2 -translate-y-1/2 left-[-60px] cursor-pointer'>
				<svg
					xmlns='http://www.w3.org/2000/svg'
					viewBox='0 0 640 640'
					className='w-8 h-8 fill-cta'
				>
					<path d='M169.4 297.4C156.9 309.9 156.9 330.2 169.4 342.7L361.4 534.7C373.9 547.2 394.2 547.2 406.7 534.7C419.2 522.2 419.2 501.9 406.7 489.4L237.3 320L406.6 150.6C419.1 138.1 419.1 117.8 406.6 105.3C394.1 92.8 373.8 92.8 361.3 105.3L169.3 297.3z' />
				</svg>
			</div>
			<div className='swiper-button-next-custom absolute top-1/2 -translate-y-1/2 right-[-60px] cursor-pointer'>
				<svg
					xmlns='http://www.w3.org/2000/svg'
					viewBox='0 0 640 640'
					className='w-8 h-8 fill-cta'
				>
					<path d='M471.1 297.4C483.6 309.9 483.6 330.2 471.1 342.7L279.1 534.7C266.6 547.2 246.3 547.2 233.8 534.7C221.3 522.2 221.3 501.9 233.8 489.4L403.2 320L233.9 150.6C221.4 138.1 221.4 117.8 233.9 105.3C246.4 92.8 266.7 92.8 279.2 105.3L471.2 297.3z' />
				</svg>
			</div>
		</div>
	);
};
export default ImageCarousel;
