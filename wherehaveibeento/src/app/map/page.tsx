import dynamic from 'next/dynamic'

const Map = dynamic(
  () => import('@/components/map'),
  { ssr: false }
)

export default function Page() {
    return (
      <div>
        <Map />
      </div>
    );
  }
  