import * as Popover from "@radix-ui/react-popover";
import { HiSparkles } from "react-icons/hi2";
import axios from "axios";
import React from "react";
import { toast } from "sonner";
import { VscLoading } from "react-icons/vsc";
import ReactMarkdown from "react-markdown";

function PopoverDemo({
  compareId,
  results,
  aiReply,
  setAiReply,
  aiLoading,
  setAiLoading,
  images = [],
}) {
  async function AI() {
    try {
      if (aiLoading) return;

      // ✅ FIX: Allow guests. We only check if there is data to analyze.
      if (!results || results.length === 0) {
        toast.error("No comparison data found. Please try comparing again.");
        return;
      }

      setAiLoading(true);

      // We send comparisonId (if logged in) and the data.
      // The backend will handle the rest.
      const res = await axios.post("/api/recommendation", {
        comparisonId: compareId,
        reply: results,
      });

      setAiReply(res.data.data || res.data.message);
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.details || "Failed to generate recommendation."
      );
    } finally {
      setAiLoading(false);
    }
  }

  // Parse the AI response (it might be JSON or plain text)
  let parsedReply = { index: null, explanation: "" };
  let isJson = false;

  if (aiReply) {
    try {
      if (typeof aiReply === "object" && aiReply !== null) {
        parsedReply = aiReply;
        isJson = true;
      } else {
        const cleanJson = aiReply
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        parsedReply = JSON.parse(cleanJson);
        isJson = true;
      }
    } catch (e) {
      parsedReply.explanation = typeof aiReply === "string" ? aiReply : "";
    }
  }

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          onClick={AI}
          className="text-center text-white mr-20 text-[18px] rounded-full font-bold w-[220px] h-[52px] compare-button flex flex-row justify-center items-center font-vagRounded cursor-pointer hover:brightness-110 transition-all"
        >
          <HiSparkles className="text-2xl text-white mr-2" />
          AI Recommendation
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="glass-button1 text-white z-50 !w-[350px] rounded-xl shadow-[0_10px_38px_-10px_hsla(206,22%,7%,.35),0_10px_20px_-15px_hsla(206,22%,7%,.2)] will-change-[transform,opacity] data-[state=open]:data-[side=bottom]:animate-slideUpAndFade data-[state=open]:data-[side=left]:animate-slideRightAndFade data-[state=open]:data-[side=right]:animate-slideLeftAndFade data-[state=open]:data-[side=top]:animate-slideDownAndFade"
          sideOffset={5}
          side="top"
        >
          <div className="flex flex-col justify-center items-center gap-4 px-6 py-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {aiLoading ? (
              <div className="min-h-[150px] flex items-center justify-center">
                <VscLoading className="animate-spin text-white text-4xl" />
              </div>
            ) : (
              <>
                <p className="mb-2 text-[16px] font-bold sticky top-0 bg-transparent backdrop-blur-md w-full text-center pb-2 border-b border-white/10">
                  AI Analysis
                </p>

                {aiReply ? (
                  <div className="flex flex-col items-center w-full animate-in fade-in zoom-in duration-300">
                    {/* Only show image if we successfully parsed an index */}
                    {isJson &&
                      parsedReply.index !== undefined &&
                      parsedReply.index !== null &&
                      images[parsedReply.index] && (
                        <div className="relative mb-3 group">
                          <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                          <img
                            src={images[parsedReply.index]}
                            alt="Best Choice"
                            className="relative w-32 h-32 object-contain rounded-lg bg-white/10 border border-white/20 p-2"
                          />
                          <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                            Best Pick
                          </div>
                        </div>
                      )}

                    <div className="text-sm leading-relaxed text-white/90 whitespace-pre-wrap text-left w-full markdown-content">
                      <ReactMarkdown>{parsedReply.explanation}</ReactMarkdown>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-5 gap-2 text-center">
                    <HiSparkles className="text-3xl text-yellow-300 opacity-80" />
                    <p className="text-white/60 italic text-sm">
                      Click the button to generate a comparison analysis.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
          <Popover.Arrow className="fill-white/20" width={15} height={8} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export default PopoverDemo;
