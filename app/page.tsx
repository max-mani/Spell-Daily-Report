import Image from "next/image"
import reportData from "../data/report-data.json"
import { PdfDownloadButton } from "@/components/pdf-download-button"

export default function Home() {
  const { overall, thisMonth, accomplishments, wordBank, progressContainers } = reportData

  const numberStyle = {
    fontFamily: "var(--font-pattaya)",
    color: "#d3d3d3",
    WebkitTextStroke: "3px black",
    textShadow: "6px 6px 0px rgba(0,0,0,0.8), 8px 8px 12px rgba(0,0,0,0.5)",
  }

  const purpleColor = "#8c52ff"

  const renderProgressContainer = (container: typeof progressContainers[0], index: number) => {
    const { days, spellings, statuses, note } = container
    const numCols = days.length
    const hasNote = note && note.length > 0

    // Create dynamic grid template columns based on number of days
    const gridTemplateColumns = `repeat(${numCols}, 1fr)`

    return (
      <div
        key={index}
        className={`relative w-full mb-6 ${hasNote ? "h-[280px]" : "h-[200px]"}`}
      >
        <div className="absolute inset-0 bg-white rounded-[20px] shadow-[8px_8px_0px_rgba(0,0,0,0.2)]" />
        <div 
          className={`absolute inset-4 ${hasNote ? "bottom-16" : ""} grid grid-rows-2`}
          style={{ gridTemplateColumns }}
        >
          {/* Top row - Days */}
          {days.map((day, dayIndex) => (
            <div
              key={dayIndex}
              className={`flex items-center justify-center border-b-[4px] border-gray-400 ${
                dayIndex < days.length - 1 ? "border-r-[4px]" : ""
              }`}
            >
              <span className="font-bold text-lg" style={{ fontFamily: "Georgia, serif", color: "#8c52ff" }}>
                {day}
              </span>
            </div>
          ))}
          {/* Bottom row - Spellings */}
          {spellings.map((spelling, spellIndex) => {
            const status = statuses[spellIndex]
            const textColor = status === "correct" ? "#16a34a" : "#ef4444" // green-600 and red-500 as hex
            return (
              <div
                key={spellIndex}
                className={`flex items-center justify-center border-gray-400 ${
                  spellIndex < spellings.length - 1 ? "border-r-[4px]" : ""
                }`}
              >
                <span className="text-lg" style={{ fontFamily: "Georgia, serif", color: textColor }}>
                  {spelling}
                </span>
              </div>
            )
          })}
        </div>
        {/* Bottom text INSIDE container */}
        {hasNote && (
          <p
            className="absolute bottom-4 left-0 right-0 text-center text-base z-10"
            style={{ fontFamily: "Georgia, serif", color: "#000000" }}
          >
            {note}
          </p>
        )}
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#8c52ff] p-8">
      {/* Main content area - includes logo for PDF */}
      <div className="max-w-[1200px] mx-auto" id="pdf-content">
        {/* Logo at top center - smaller size */}
        <div className="flex justify-center mb-8">
          <Image src="/logo.svg" alt="Yukktha Logo" width={150} height={104} priority />
        </div>
        {/* Top row: Overall and This Month side by side */}
        <div className="flex gap-6 mb-10">
          {/* Overall container */}
          <div className="relative w-[320px] h-[340px]">
            <div className="absolute inset-0 bg-white rounded-[20px] shadow-[8px_8px_0px_rgba(0,0,0,0.2)]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <Image src="/overall.svg" alt="Overall label" width={180} height={70} />
            </div>
            <div className="absolute top-16 left-1/2 -translate-x-1/2">
              <span className="text-[120px]" style={numberStyle}>
                {overall.wordsPracticed}
              </span>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <Image src="/words_practiced.svg" alt="Words Practiced" width={200} height={80} />
            </div>
          </div>

          {/* This Month container */}
          <div className="relative flex-1 h-[340px]">
            <div className="absolute inset-0 bg-white rounded-[20px] shadow-[8px_8px_0px_rgba(0,0,0,0.2)]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <Image src="/this_month.svg" alt="This Month label" width={220} height={70} />
            </div>
            <div className="absolute top-16 left-0 right-0 flex justify-around px-12">
              <span className="text-[120px]" style={numberStyle}>
                {thisMonth.wordsPracticed}
              </span>
              <span className="text-[120px]" style={numberStyle}>
                {thisMonth.wordsMissed}
              </span>
            </div>
            <div className="absolute bottom-4 left-0 right-0 flex justify-around px-8">
              <Image src="/words_practicedthis_month.svg" alt="Words Practiced This Month" width={220} height={80} />
              <Image src="/words_missedthis_month.svg" alt="Words Missed This Month" width={220} height={80} />
            </div>
          </div>
        </div>

        {/* Word Bank container */}
        <div className="relative w-full h-[360px] mb-10">
          <div className="absolute inset-0 bg-white rounded-[20px] shadow-[8px_8px_0px_rgba(0,0,0,0.2)]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <Image src="/word_bank.svg" alt="Word Bank label" width={200} height={70} />
          </div>
          <div className="absolute inset-0 pt-14 px-10 pb-10">
            <div className="grid grid-cols-7 gap-x-6 gap-y-3 justify-items-center">
              {wordBank.words.map((wordObj, index) => (
                <span
                  key={index}
                  className="text-base font-medium"
                  style={{ 
                    fontFamily: "Georgia, serif",
                    color: wordObj.isCorrect ? "#000000" : "#ef4444" // black and red-500 as hex
                  }}
                >
                  {wordObj.word}
                </span>
              ))}
            </div>
            <p
              className="absolute bottom-4 left-10 text-sm italic"
              style={{ fontFamily: "Georgia, serif", color: "#ef4444" }}
            >
              Marked in red : Incorrect answers on the 1st attempt
            </p>
          </div>
        </div>

        <div className="relative w-full h-[420px] mb-10 flex overflow-visible">
          <div className="relative w-[65%] h-full overflow-visible">
            <div className="absolute inset-0 bg-white rounded-[20px] shadow-[8px_8px_0px_rgba(0,0,0,0.2)]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <Image src="/accomplishments.svg" alt="Accomplishments label" width={280} height={70} />
            </div>
            <div className="absolute top-8 left-0 right-0 flex justify-around pl-12 pr-8 overflow-visible">
              {/* Number 12 with fire BEHIND - text below number */}
              <div className="flex flex-col items-center relative w-[45%] max-w-[300px]">
                <div className="relative flex items-center justify-center" style={{ minHeight: '200px', marginBottom: '16px' }}>
                  <div className="absolute top-[32%] z-0 left-0 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: '178px', height: '200px', zIndex: 0 }}>
                    <Image src="/fire.svg" alt="Fire streak" width={178} height={200} className="w-full h-full" style={{ position: 'absolute', zIndex: 0 }} />
                  </div>
                  <span className="text-[160px] relative z-10" style={{ ...numberStyle, position: 'relative', zIndex: 10 }}>
                    {accomplishments.daysStreak}
                  </span>
                </div>
                <p
                  className="text-base text-center max-w-[280px] relative z-20 px-2"
                  style={{ fontFamily: "Georgia, serif", color: "#000000", wordWrap: "break-word", position: 'relative', zIndex: 20, marginTop: '8px' }}
                >
                  <span className="font-bold" style={{ color: "#000000" }}>{accomplishments.daysStreak} days</span> - unstoppable consistency!
                </p>
              </div>
              {/* Number 16 with bullseye BEHIND - text below number */}
              <div className="flex flex-col items-center relative w-[45%] max-w-[300px]">
                <div className="relative flex items-center justify-center" style={{ minHeight: '200px', marginBottom: '16px' }}>
                  <div className="absolute top-[32%] z-0 left-0 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: '220px', height: '220px', zIndex: 0 }}>
                    <Image src="/bullseye.svg" alt="Bullseye" width={220} height={220} className="w-full h-full" style={{ position: 'absolute', zIndex: 0 }} />
                  </div>
                  <span className="text-[160px] relative z-10" style={{ ...numberStyle, position: 'relative', zIndex: 10 }}>
                    {accomplishments.bullseyeCount}
                  </span>
                </div>
                <p
                  className="text-base text-center max-w-[280px] relative z-20 px-2"
                  style={{ fontFamily: "Georgia, serif", color: "#000000", wordWrap: "break-word", position: 'relative', zIndex: 20, marginTop: '8px' }}
                >
                  A bullseye means your child completed the day&apos;s tasks with zero mistakes.
                </p>
              </div>
            </div>
          </div>
          <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-[380px] h-[460px] z-10">
            <Image src="/cup.svg" alt="Trophy cup" fill className="object-contain" />
          </div>
        </div>

        {/* Progress heading - left aligned */}
        <div className="mb-6">
          <Image src="/progress_heading.svg" alt="Progress Heading" width={300} height={60} />
        </div>

        {/* Progress containers - dynamically rendered from array */}
        {progressContainers.map((container, index) => renderProgressContainer(container, index))}

        <div className="py-6">
          <p className="text-white text-xl font-semibold text-left" style={{ fontFamily: "Georgia, serif" }}>
            In the next attempts, she mastered these tricky words!
          </p>
        </div>

        <div className="relative w-full h-[100px] mb-10">
          <div className="absolute inset-0 bg-white rounded-[20px] shadow-[8px_8px_0px_rgba(0,0,0,0.2)]" />
          <div className="relative flex items-center justify-center h-full px-8 z-10">
            <p className="text-base" style={{ fontFamily: "Georgia, serif", color: "#000000" }}>
              <span className="font-bold">Note for Parents :</span> Even mastered words can be misspelled. Regular
              practice and celebrating small wins help maintain progress!
            </p>
          </div>
        </div>

        {/* PDF Download Button at bottom */}
        <PdfDownloadButton />
      </div>
    </main>
  )
}
