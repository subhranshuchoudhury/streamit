import pb from "@/lib/pocketbase";

export const fetchStreamSource = async ({
    video_id,
    library_id,
}: {
    video_id: string;
    library_id: string;
}) => {

    try {

        const response = await pb.send("/api/iframe-stream-source", {
            method: "POST",
            body: JSON.stringify({ video_id, library_id }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        return {
            source: response.source,
            token: response.token,
            expires: response.expires,
            message: response?.message,
            redirect: response?.redirect,
        };
    } catch (error) {

        console.error("Error fetching stream source:", error);
        throw error;
    }
};