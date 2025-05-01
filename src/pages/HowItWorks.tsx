import { ChevronRight } from "lucide-react"
import { useState } from "react"
import { Started } from "../components/shared/Started"
import { Hero } from "../components/shared/Hero"

export const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState<string>("host")

  return (
    <>
      <Hero
        title="How it Works"
        subtitle="Participate in a raffle and win amazing prizes"
        backgroundImage="/images/tb2.png"
      />
      <div className="container py-4 px-4 mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-6xl font-bold py-2 px-2">How <span className="text-btn-primary">Raffles</span> works</h1>
          <p className="text-xl md:text-2xl font-semibold py-2 px-2">RaffleIt has several benefits</p>
        </div>
        <div className="grid grid-cols-1 gap-x-4 gap-y-6 md:grid-cols-4">
          <div className="col-span-1 shadow-lg w-full px-4 py-4 mt-4 mb-4">
            <h3 className="font-bold text-xl">50% of the total</h3>
            <p>The winner gets the price, the person or company who issues the raffle receives 50% of the total</p>
          </div>
          <div className="col-span-1 shadow-lg w-full px-4 py-4 mt-4 mb-4">
            <h3 className="font-bold text-xl">Easy Setup</h3>
            <p>Set up is free and can be done in a few minutes from the comfort of your home or office</p>
          </div>
          <div className="col-span-1 shadow-lg w-full px-4 py-4 mt-4 mb-4">
            <h3 className="font-bold text-xl">Ticket Growth</h3>
            <p>You can watch your raffle grow as persons purchase tickets</p>
          </div>
          <div className="col-span-1 shadow-lg w-full px-4 py-4 mt-4 mb-4">
            <h3 className="font-bold text-xl">Winners</h3>
            <p>Winners are selected automatically</p>
          </div>
          <div className="col-span-1 shadow-lg w-full px-4 py-4 mt-4 mb-4">
            <h3 className="font-bold text-xl">Supports</h3>
            <p>RaffleIt App ensures people everywhere, support your cause without taking part in the raffle.</p>
          </div>
          <div className="col-span-1 shadow-lg w-full px-4 py-4 mt-4 mb-4">
            <h3 className="font-bold text-xl">Doorstep Delivery</h3>
            <p>Set up is free and can be done in a few minutes from the comfort of your home or office</p>
          </div>
          <div className="col-span-1 shadow-lg w-full px-4 py-4 mt-4 mb-4">
            <h3 className="font-bold text-xl">Electronic Tickets</h3>
            <p>Tickets are electronic and can be shared through links and QR codes</p>
          </div>
          <div className="col-span-1 shadow-lg w-full px-4 py-4 mt-4 mb-4">
            <h3 className="font-bold text-xl">Easy to Use</h3>
            <p>Very Easy to Use: Paperless and Cashless</p>
          </div>
        </div>
        <div className="mx-auto py-4 px-4 flex flex-wrap flex-column md:flex-row items-center justify-center gap-4">
          <a href="/" className='bg-btn-primary text-white px-4 py-2 rounded flex flex-row items-center font-semibold'>Start Raffling <ChevronRight className='ml-2 w-4 h-4' /></a>
          <a href="/" className='bg-white border border-text-primary text-text-primary px-4 py-2 rounded flex flex-row items-center hover:bg-text-primary hover:border-none hover:text-white font-semibold transition duration-100'>Create Raffle <ChevronRight className='ml-2 w-4 h-4' /></a>
        </div>
      </div>

      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center mb-4">
          <button
            className={`px-4 py-2 mx-2 rounded ${activeTab === "host" ? "bg-btn-primary text-white" : "bg-gray-200 text-black"}`}
            onClick={() => setActiveTab("host")}
          >
            For Host
          </button>
          <div className="h-6 w-px bg-gray-400"></div>
          <button
            className={`px-4 py-2 mx-2 rounded ${activeTab === "supporters" ? "bg-btn-primary text-white" : "bg-gray-200 text-black"}`}
            onClick={() => setActiveTab("supporters")}
          >
            For Supporters
          </button>
        </div>
        <div className="border border-gray-300 rounded p-4">
          {activeTab === "host" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">For Host</h2>
              <h3 className="text-xl font-semibold mt-4">How to start a 50/50 raffle</h3>
              <p>Create an account by clicking here or download the iOS or Android app</p>
              <p>Click here and Create Raffle</p>
              <p>Get a link and share with others that would like to support your raffle.</p>
              <p>Don't forget to add your run time</p>
              <h3 className="text-xl font-semibold mt-4">Uses</h3>
              <p>To raise funds for any cause at any time where ever you are</p>
              <h3 className="text-xl font-semibold mt-4">Pay out</h3>
              <p>Payment is fully secured</p>
              <p>As soon as the winner confirms that the price has been received the payout is done within 2 to 7 days depending on location and mode of cash transfer.</p>
              <p>Payouts are done after hosting and shipping fees are deducted</p>
              <h3 className="text-xl font-semibold mt-4">Other</h3>
              <p>Remember to check the legal requirements in your country for such activities</p>
              <p>Bank fees (if the transfer is done via the bank) will also be deducted from the payout by the bank</p>
            </div>
          )}
          {activeTab === "supporters" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">For Supporters</h2>
              <h3 className="text-xl font-semibold mt-4">How It Works</h3>
              <ul className="list-disc pl-6">
                <li>Create an account OR just support the cause by using the link or better yet download the APP iOS or Android to give you a full experience.</li>
                <li>Find other agencies, organisations and raffles.</li>
                <li>Get as many tickets as you can afford. The more tickets the greater the savings.</li>
                <li>Share your raffle links with family, friends and colleagues.</li>
                <li>If you are a winner, your prize will be shipped to you within two days. You will receive it within 5 to 14 days depending on location.</li>
                <li>Remember to check the legal requirements in your country for such activities.</li>
              </ul>
            </div>
          )}
        </div>
        <Started />
      </div>
    </>
  )
}
