export function getEmbedUrl(videoUrl) {
  if (videoUrl.includes("youtu.be") || videoUrl.includes("youtube.com")) {
    // Handle YouTube URLs
    const videoId = videoUrl.includes("youtu.be")
      ? videoUrl.split("/").pop()
      : new URL(videoUrl).searchParams.get("v");
    return `https://www.youtube.com/embed/${videoId}`;
  } else if (videoUrl.includes("vimeo.com")) {
    // Handle Vimeo URLs
    const videoId = videoUrl.split("/").pop();
    return `https://player.vimeo.com/video/${videoId}`;
  } else {
    // For other URLs, return as is (assuming they're already in embed format)
    return videoUrl;
  }
}
