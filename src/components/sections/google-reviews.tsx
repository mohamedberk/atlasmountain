'use client'

import { useCallback } from 'react'
import { motion } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import useEmblaCarousel from 'embla-carousel-react'
import AutoScroll from 'embla-carousel-auto-scroll'
import { useGoogleReviews } from '@/hooks/useGoogleReviews'

const TRIPADVISOR_URL = 'https://www.tripadvisor.com/Attraction_Review-g293734-d25345173-Reviews-Green_Atlas_Travel-Marrakech_Marrakech_Safi.html'

const ACCENT_GREEN = '#49b540'

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
}

export function GoogleReviews() {
  const { reviews: googleReviews, overallRating, totalReviews } = useGoogleReviews({
    minRating: 4,
  })

  const [reviewEmblaRef, reviewEmblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    skipSnaps: false,
    dragFree: true,
    containScroll: false,
  }, [
    AutoScroll({
      speed: 0.6,
      stopOnInteraction: true,
      stopOnMouseEnter: true,
      playOnInit: true,
    }),
  ])

  const scrollReviewsPrev = useCallback(() => {
    if (reviewEmblaApi) reviewEmblaApi.scrollPrev()
  }, [reviewEmblaApi])

  const scrollReviewsNext = useCallback(() => {
    if (reviewEmblaApi) reviewEmblaApi.scrollNext()
  }, [reviewEmblaApi])

  const GOOGLE_PLACE_ID = process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID || 'YOUR_PLACE_ID'

  return (
    <section className="py-20 sm:py-28 bg-white relative overflow-hidden">
      {/* Decorative blurred radials */}
      <div
        className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none -translate-x-1/3 -translate-y-1/3"
        style={{ backgroundColor: `${ACCENT_GREEN}08` }}
      />
      <div
        className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3"
        style={{ backgroundColor: `${ACCENT_GREEN}08` }}
      />

      <div className="max-w-[1280px] mx-auto px-6 sm:px-20 relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="flex flex-col items-center gap-10"
        >
          {/* Header */}
          <motion.div variants={fadeUp} className="text-center flex flex-col items-center gap-4">
            <span className="text-[#49b540] text-sm font-medium tracking-wide">
              Guest Reviews
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-neutral-900">
              What Our Guests Say
            </h2>
            {/* Overall Ratings: Google + TripAdvisor */}
            <div className="flex flex-wrap items-center justify-center gap-x-10 sm:gap-x-12 gap-y-3 mt-1">
              {/* Google */}
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                  <path d="M21.8055 10.0415H12V14.0415H17.6515C16.827 16.3275 14.6115 17.9555 12 17.9555C8.8385 17.9555 6.267 15.384 6.267 12.2225C6.267 9.06097 8.8385 6.48947 12 6.48947C13.5255 6.48947 14.9155 7.06447 15.9585 8.01747L18.873 5.10297C17.085 3.42747 14.6715 2.39697 12 2.39697C6.4785 2.39697 2 6.87547 2 12.397C2 17.9185 6.4785 22.397 12 22.397C18.24 22.397 22.5 17.0655 22.5 11.147C22.5 10.787 22.473 10.4125 22.41 10.0415H21.8055Z" fill="#4285F4"/>
                  <path d="M3.15454 7.45574L6.43704 9.87724C7.32754 7.89424 9.48004 6.48949 12 6.48949C13.5255 6.48949 14.9155 7.06449 15.9585 8.01749L18.873 5.10299C17.085 3.42749 14.6715 2.39699 12 2.39699C8.1585 2.39699 4.82704 4.49999 3.15454 7.45574Z" fill="#EA4335"/>
                  <path d="M12 22.397C14.6115 22.397 16.9695 21.4145 18.74 19.8115L15.5115 17.1975C14.5717 17.8679 13.3654 18.255 12 18.255C9.39904 18.255 7.19054 16.6415 6.35404 14.3695L3.09754 16.8925C4.75204 20.1555 8.13754 22.397 12 22.397Z" fill="#34A853"/>
                  <path d="M22.5 11.147C22.5 10.787 22.473 10.4125 22.41 10.0415H12V14.0415H17.6515C17.2635 15.1185 16.437 16.0175 15.51 16.6305L15.5115 16.6305L18.7415 19.2425C18.4845 19.476 22.5 16.5 22.5 11.147Z" fill="#FBBC05"/>
                </svg>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-[#49b540] text-[#49b540]" />
                  ))}
                </div>
                <span className="font-bold text-lg text-neutral-900">{overallRating?.toFixed(1) || '4.8'}</span>
              </div>

              {/* Divider */}
              <div className="h-8 w-px bg-neutral-300" />

              {/* TripAdvisor */}
              <div className="flex items-center gap-2">
                <Image src="/tripadvisor.png" alt="TripAdvisor" width={28} height={28} className="w-7 h-7" />
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-4 h-4 rounded-full bg-[#00AA6C]" />
                  ))}
                </div>
                <span className="font-bold text-lg text-neutral-900">5.0</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Google Reviews Carousel */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-12 relative group"
      >
        {/* Navigation Arrows (visible on hover) */}
        <button
          onClick={scrollReviewsPrev}
          className="absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 z-10 w-11 h-11 bg-white/90 backdrop-blur-sm rounded-full border border-neutral-200 flex items-center justify-center hover:bg-white hover:scale-105 transition-all opacity-0 group-hover:opacity-100"
          aria-label="Previous reviews"
        >
          <ChevronLeft className="w-5 h-5 text-neutral-900" />
        </button>
        <button
          onClick={scrollReviewsNext}
          className="absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 z-10 w-11 h-11 bg-white/90 backdrop-blur-sm rounded-full border border-neutral-200 flex items-center justify-center hover:bg-white hover:scale-105 transition-all opacity-0 group-hover:opacity-100"
          aria-label="Next reviews"
        >
          <ChevronRight className="w-5 h-5 text-neutral-900" />
        </button>

        {/* Embla Carousel */}
        <div className="overflow-hidden px-6 sm:px-16 cursor-grab active:cursor-grabbing" ref={reviewEmblaRef}>
          <div className="flex">
            {[...googleReviews, ...googleReviews].map((review, i) => (
              <div key={i} className="flex-[0_0_300px] sm:flex-[0_0_360px] min-w-0 px-3">
                <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-[0_1px_4px_rgba(0,0,0,0.02)] flex flex-col h-full min-h-[220px] hover:border-[#49b540]/30 hover:shadow-[0_6px_14px_-10px_rgba(0,0,0,0.04)] transition-all duration-300">
                  {/* User info + Google icon */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {review.profilePhotoUrl ? (
                        <img
                          src={review.profilePhotoUrl}
                          alt={review.name}
                          className="w-11 h-11 rounded-full object-cover ring-2 ring-neutral-200"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-[#49b540] flex items-center justify-center text-white font-semibold text-sm ring-2 ring-[#49b540]/20">
                          {review.avatar}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-semibold text-[15px] text-neutral-900">{review.name}</span>
                        <span className="text-xs text-neutral-500">{review.date}</span>
                      </div>
                    </div>
                    {/* Small Google icon */}
                    <svg className="w-5 h-5 shrink-0 mt-1" viewBox="0 0 24 24" fill="none">
                      <path d="M21.8055 10.0415H12V14.0415H17.6515C16.827 16.3275 14.6115 17.9555 12 17.9555C8.8385 17.9555 6.267 15.384 6.267 12.2225C6.267 9.06097 8.8385 6.48947 12 6.48947C13.5255 6.48947 14.9155 7.06447 15.9585 8.01747L18.873 5.10297C17.085 3.42747 14.6715 2.39697 12 2.39697C6.4785 2.39697 2 6.87547 2 12.397C2 17.9185 6.4785 22.397 12 22.397C18.24 22.397 22.5 17.0655 22.5 11.147C22.5 10.787 22.473 10.4125 22.41 10.0415H21.8055Z" fill="#4285F4"/>
                      <path d="M3.15454 7.45574L6.43704 9.87724C7.32754 7.89424 9.48004 6.48949 12 6.48949C13.5255 6.48949 14.9155 7.06449 15.9585 8.01749L18.873 5.10299C17.085 3.42749 14.6715 2.39699 12 2.39699C8.1585 2.39699 4.82704 4.49999 3.15454 7.45574Z" fill="#EA4335"/>
                      <path d="M12 22.397C14.6115 22.397 16.9695 21.4145 18.74 19.8115L15.5115 17.1975C14.5717 17.8679 13.3654 18.255 12 18.255C9.39904 18.255 7.19054 16.6415 6.35404 14.3695L3.09754 16.8925C4.75204 20.1555 8.13754 22.397 12 22.397Z" fill="#34A853"/>
                      <path d="M22.5 11.147C22.5 10.787 22.473 10.4125 22.41 10.0415H12V14.0415H17.6515C17.2635 15.1185 16.437 16.0175 15.51 16.6305L15.5115 16.6305L18.7415 19.2425C18.4845 19.476 22.5 16.5 22.5 11.147Z" fill="#FBBC05"/>
                    </svg>
                  </div>

                  {/* Stars */}
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${s < review.rating ? 'fill-[#49b540] text-[#49b540]' : 'fill-neutral-200 text-neutral-200'}`}
                      />
                    ))}
                  </div>

                  {/* Review text */}
                  <p className="text-neutral-600 text-sm leading-relaxed line-clamp-4 flex-1">
                    &ldquo;{review.text}&rdquo;
                  </p>

                  {/* Footer */}
                  <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-[11px] text-neutral-400">Posted on Google</span>
                    {review.profileUrl && (
                      <a
                        href={review.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-[#49b540] hover:underline"
                      >
                        View profile
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* "See all reviews" — Google + TripAdvisor button cards */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 mt-12 px-6 relative">
        <a
          href={`https://search.google.com/local/reviews?placeid=${GOOGLE_PLACE_ID}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center justify-center gap-3 bg-white rounded-2xl px-6 py-4 border border-neutral-200 shadow-sm hover:border-[#49b540]/40 hover:shadow-md transition-all duration-200"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
            <path d="M21.8055 10.0415H12V14.0415H17.6515C16.827 16.3275 14.6115 17.9555 12 17.9555C8.8385 17.9555 6.267 15.384 6.267 12.2225C6.267 9.06097 8.8385 6.48947 12 6.48947C13.5255 6.48947 14.9155 7.06447 15.9585 8.01747L18.873 5.10297C17.085 3.42747 14.6715 2.39697 12 2.39697C6.4785 2.39697 2 6.87547 2 12.397C2 17.9185 6.4785 22.397 12 22.397C18.24 22.397 22.5 17.0655 22.5 11.147C22.5 10.787 22.473 10.4125 22.41 10.0415H21.8055Z" fill="#4285F4"/>
            <path d="M3.15454 7.45574L6.43704 9.87724C7.32754 7.89424 9.48004 6.48949 12 6.48949C13.5255 6.48949 14.9155 7.06449 15.9585 8.01749L18.873 5.10299C17.085 3.42749 14.6715 2.39699 12 2.39699C8.1585 2.39699 4.82704 4.49999 3.15454 7.45574Z" fill="#EA4335"/>
            <path d="M12 22.397C14.6115 22.397 16.9695 21.4145 18.74 19.8115L15.5115 17.1975C14.5717 17.8679 13.3654 18.255 12 18.255C9.39904 18.255 7.19054 16.6415 6.35404 14.3695L3.09754 16.8925C4.75204 20.1555 8.13754 22.397 12 22.397Z" fill="#34A853"/>
            <path d="M22.5 11.147C22.5 10.787 22.473 10.4125 22.41 10.0415H12V14.0415H17.6515C17.2635 15.1185 16.437 16.0175 15.51 16.6305L15.5115 16.6305L18.7415 19.2425C18.4845 19.476 22.5 16.5 22.5 11.147Z" fill="#FBBC05"/>
          </svg>
          <span className="text-sm font-semibold text-neutral-900">See all reviews on Google</span>
          <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-[#49b540] group-hover:translate-x-0.5 transition-all" />
        </a>

        <a
          href={TRIPADVISOR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center justify-center gap-3 bg-white rounded-2xl px-6 py-4 border border-neutral-200 shadow-sm hover:border-[#00AA6C]/40 hover:shadow-md transition-all duration-200"
        >
          <Image src="/tripadvisor.png" alt="TripAdvisor" width={28} height={28} className="w-6 h-6 shrink-0" />
          <span className="text-sm font-semibold text-neutral-900">See all reviews on TripAdvisor</span>
          <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-[#00AA6C] group-hover:translate-x-0.5 transition-all" />
        </a>
      </div>
    </section>
  )
}
