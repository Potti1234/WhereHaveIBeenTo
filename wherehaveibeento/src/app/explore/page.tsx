import Link from "next/link";

export default function Page() {
    return (
        <div>
            <Link href="/explore/country">Explore Countries</Link>
            <Link href="/explore/city">Explore Cities</Link>
        </div>
    )
}