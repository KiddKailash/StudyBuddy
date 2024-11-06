import { YoutubeTranscript } from "youtube-transcript";

export default function fetchTranscript(URL) {
  YoutubeTranscript.fetchTranscript(URL).then(console.log);
}
