import dynamic from 'next/dynamic'

const Map = dynamic(
  () => import('@/components/map'),
  { ssr: false }
)

export default function Page({ params }: { params: { user_id: string } }) {
    return (
      <div>
        <Map user_id={params.user_id}/>
      </div>
    );
  }
  