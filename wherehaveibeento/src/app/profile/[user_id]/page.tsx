import Profile from "../profile";

export default function Page ({ params }: { params: { user_id: string } }) {
    return (
        <Profile user_id={params.user_id}/>
    )
}