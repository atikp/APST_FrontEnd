import * as Tooltip from "@radix-ui/react-tooltip";
import { useState } from "react";
import { InformationCircleIcon } from '@heroicons/react/24/outline';

const MobileFriendlyTooltip = ({title, message } ) => {
  const [open, setOpen] = useState(false);

  return (
    <Tooltip.Provider delayDuration={0}>
      <div className="flex items-center justify-center self-center place-self-center mb-10">
        <h1 className="z-50 text-4xl dark:text-white">
          {title}
        </h1>

        <Tooltip.Root open={open} onOpenChange={setOpen}>
          <Tooltip.Trigger asChild>
            <button
              className="ml-3"
              onTouchStart={() => setOpen((prev) => !prev)} // 👈 mobile support
            >
              <InformationCircleIcon className="w-6 h-6 text-blue-500 hover:text-blue-700" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              className="bg-black text-white text-sm rounded px-3 py-1 shadow-md  w-50 z-50"
              side="right"
              sideOffset={5}
            >
              {message}
              <Tooltip.Arrow className="fill-black" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </div>
    </Tooltip.Provider>
  );
};

export default MobileFriendlyTooltip;