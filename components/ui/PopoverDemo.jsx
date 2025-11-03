import { Popover } from "radix-ui";
import { HiSparkles } from "react-icons/hi2";
import axios from "axios";
import { React, useState } from "react";
import { toast } from "sonner";
import { VscLoading } from "react-icons/vsc";
function PopoverDemo({ compareId, results }) {
  const [reply, setReply] = useState();
  const [loading, setLoading] = useState(false);

  async function AI() {
    try {
      if (loading || reply) return;
      setLoading(true);
      const res = await axios.post("/api/recommendation", {
        comparisonId: compareId,
        reply: results,
      });
      setReply(res.data.message);
    } catch (error) {
      toast.error(`${error}`);
    } finally {
      setLoading(false);
    }
  }
  return (
    <>
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            onClick={AI}
            className={` text-center text-white mr-20  text-[20px] rounded-full font-bold w-[220px] h-[52px] compare-button flex  flex-row justify-center items-center font-vagRounded cursor-pointer`}
          >
            <HiSparkles className="text-2xl text-white" />
            AI Recomendation
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className="glass-button1 text-white z-90 !w-[260px] rounded shadow-[0_10px_38px_-10px_hsla(206,22%,7%,.35),0_10px_20px_-15px_hsla(206,22%,7%,.2)] will-change-[transform,opacity] focus:shadow-[0_10px_38px_-10px_hsla(206,22%,7%,.35),0_10px_20px_-15px_hsla(206,22%,7%,.2),0_0_0_2px_theme(colors.violet7)] data-[state=open]:data-[side=bottom]:animate-slideUpAndFade data-[state=open]:data-[side=left]:animate-slideRightAndFade data-[state=open]:data-[side=right]:animate-slideLeftAndFade data-[state=open]:data-[side=top]:animate-slideDownAndFade"
            sideOffset={5}
            side="top"
          >
            <div className="min-h-96 flex flex-col justify-center items-center gap-2.5 px-3 py-2">
              {loading ? (
                <VscLoading className="animate-spin text-white text-4xl" />
              ) : (
                <>
                  <p className="mb-2.5 text-[15px] font-medium leading-[19px]">
                    AI Recommendations
                  </p>
                  <p className="text-center text-sm whitespace-pre-wrap">
                    {reply}
                  </p>
                </>
              )}
            </div>

            <Popover.Arrow
              className="fill-white drop-shadow-md"
              width={15}
              height={8}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </>
  );
}

export default PopoverDemo;
