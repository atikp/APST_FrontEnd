import StockWatch from './SmallerComponents/StockWatch';
import TopNews from './SmallerComponents/TopNews';
import * as Tooltip from '@radix-ui/react-tooltip';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

export default function DashBoard({ PROPSYMBOLS }) {
  return (
    <main>
      <section>
        <div className="bg-white dark:bg-black">
          <div className="relative isolate px-6 pt-14 lg:px-8">
            <Tooltip.Provider delayDuration={0}>
              <div className="flex items-center justify-center self-center place-self-center mb-10">
                <h1 className="z-50 text-4xl dark:text-white">
                  Your Watched Stocks
                </h1>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button className="ml-3">
                      <InformationCircleIcon className="w-6 h-6 text-blue-500 hover:text-blue-700" />
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="bg-black text-white text-sm rounded px-3 py-1 shadow-md"
                      side="right"
                      sideOffset={5}
                    >
                      If your stocks aren't loading, try refreshing the page.
                      <Tooltip.Arrow className="fill-black" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </div>
            </Tooltip.Provider>

            <StockWatch PROPSYMBOLS={PROPSYMBOLS} />
            <div
              aria-hidden="true"
              className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
            >
              <div
                style={{
                  clipPath:
                    'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                }}
                className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
              />
            </div>
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
            >
              <div
                style={{
                  clipPath:
                    'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                }}
                className="relative left-[calc(50%+3rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
              />
            </div>
          </div>
        </div>
      </section>
      <section className="flex-col lg:p-20 md:pb-50 md:mb-10 p-5 dark:bg-black ">
        <h1 className="dark:text-white pb-5 place-self-center text-4xl">
          Top News
        </h1>
        <div className="newsCards flex flex-wrap gap-20 justify-evenly items-center">
          <TopNews />
        </div>
      </section>
    </main>
  );
}
