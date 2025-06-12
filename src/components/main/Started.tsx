import { ChevronRight } from "lucide-react";

export const Started = () => {
    return (
        <div className="container mx-auto py-4 px-4">
            <div className="text-center md:mt-10 mt-10 mb-4 w-full md:w-70/100 mx-auto">
                <h2 className="text-2xl font-bold mb-4">Get Started Today!</h2>
                <p className="text-base">Funditzone connects your raffle to persons and donors outside of your community so they can take part in the raffle or donate remotely to your cause. Revolutionize raffles and fundraising!</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-items-center gap-4">
                <div className="col-span-1 shadow-lg rounded-xl w-full px-4 py-4 mt-4 mb-4">
                    <h1 className="relative inline-block"><span className="rounded-full bg-text-primary text-white font-bold px-4.5 py-3.5 text-sm">1</span></h1>
                    <h2 className="font-bold mt-2 text-xl text-text-primary py-2 px-2">Create</h2>
                    <p className="py-2 px-2 text-gray-500">Individuals or Organizations can create an account by clicking here or by downloading the raffleit app on IOS | Google Play</p>
                </div>
                <div className="col-span-1 shadow-lg rounded-xl w-full px-4 py-4 mt-4 mb-4">
                    <h1 className="relative inline-block"><span className="rounded-full bg-btn-primary text-white font-bold px-4.5 py-3.5 text-sm">2</span></h1>
                    <h2 className="font-bold mt-2 text-xl text-btn-primary py-2 px-2">Share Raffle</h2>
                    <p className="py-2 px-2 text-gray-500">Now it's time to get a link to your raffle for you to share your fundraising event with your network.</p>
                </div>
                <div className="col-span-1 shadow-lg rounded-xl w-full px-4 py-4 mt-4 mb-4">
                    <h1 className="relative inline-block"><span className="rounded-full bg-text-primary text-white font-bold px-4.5 py-3.5 text-sm">3</span></h1>
                    <h2 className="font-bold mt-2 text-xl text-text-primary py-2 px-2">Fundraiser</h2>
                    <p className="py-2 px-2 text-gray-500">Watch your charitable donations grow in real time as technology and community sharing take your fundraising to new heights!</p>
                </div>
            </div>
            <div className="mx-auto py-4 px-4 flex flex-wrap flex-column md:flex-row items-center justify-center gap-4">
                <a href="/" className='bg-btn-primary text-white px-4 py-2 rounded flex flex-row items-center font-semibold'>Start Raffling <ChevronRight className='ml-2 w-4 h-4' /></a>
                <a href="/" className='bg-white border border-text-primary text-text-primary px-4 py-2 rounded flex flex-row items-center hover:bg-text-primary hover:border-none hover:text-white font-semibold transition duration-100'>Create Raffle <ChevronRight className='ml-2 w-4 h-4' /></a>
            </div>
        </div>
    )
}
