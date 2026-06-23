export default function EventMap({ location }: { location: string }) {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY
  const src = `https://www.google.com/maps/embed/v1/place?key=${key}&q=${encodeURIComponent(location)}`

  return (
    <div className='overflow-hidden rounded-2xl border border-border aspect-square w-full'>
      <iframe
        src={src}
        width='100%'
        height='100%'
        style={{ border: 0 }}
        allowFullScreen
        loading='lazy'
        referrerPolicy='no-referrer-when-downgrade'
      />
    </div>
  )
}
