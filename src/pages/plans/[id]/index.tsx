import { useParams } from "react-router-dom";

export default function () {
    const { id } = useParams<{ id: string }>();

    return (
        <div>
            Plan ID: {id}
        </div>
    );
}