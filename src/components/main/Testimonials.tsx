import { ChevronRight } from "lucide-react"

export const Testimonials = () => {
    return (
        <>
            <div className="container mx-auto py-4 px-4">
                <div className="text-center md:mt-10 mt-10 mb-4 w-full md:w-70/100 mx-auto">
                    <h1 className="font-bold text-text-primary">TESTIMONIALS</h1>
                    <h2 className="text-4xl mt-2 font-bold mb-4">About Past <span className="text-btn-primary">Raffles</span></h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-items-center gap-4">
                    <div className="col-span-1 shadow-lg rounded-xl w-full px-4 py-4 mt-4 mb-4">
                        <div className="relative">
                            <span className="absolute top-0 left-0 text-4xl text-btn-primary font-bold">“</span>
                        </div>
                        <p className="py-2 px-2 text-gray-500 italic">"Funditzone made fundraising so easy and effective for our organization. We reached donors we never thought possible!"</p>
                        <div className="flex items-center mt-4">
                            <span className="text-yellow-500">★★★★★</span>
                        </div>
                        <h2 className="font-bold mt-2 text-xl text-text-primary py-2 px-2">- John Doe</h2>
                    </div>
                    <div className="col-span-1 shadow-lg rounded-xl w-full px-4 py-4 mt-4 mb-4">
                        <div className="relative">
                            <span className="absolute top-0 left-0 text-4xl text-btn-primary font-bold">“</span>
                        </div>
                        <p className="py-2 px-2 text-gray-500 italic">"Sharing our raffle was seamless, and the support we received was incredible. Highly recommend Funditzone!"</p>
                        <div className="flex items-center mt-4">
                            <span className="text-yellow-500">★★★★★</span>
                        </div>
                        <h2 className="font-bold mt-2 text-xl text-btn-primary py-2 px-2">- Jane Smith</h2>
                    </div>
                    <div className="col-span-1 shadow-lg rounded-xl w-full px-4 py-4 mt-4 mb-4">
                        <div className="relative">
                            <span className="absolute top-0 left-0 text-4xl text-btn-primary font-bold">“</span>
                        </div>
                        <p className="py-2 px-2 text-gray-500 italic">"Watching our donations grow in real-time was a game-changer. Funditzone is the future of fundraising!"</p>
                        <div className="flex items-center mt-4">
                            <span className="text-yellow-500">★★★★★</span>
                        </div>
                        <h2 className="font-bold mt-2 text-xl text-text-primary py-2 px-2">- Emily Johnson</h2>
                    </div>
                </div>
                <div className="mx-auto py-4 px-4 flex flex-wrap flex-column md:flex-row items-center justify-center gap-4">
                    <a href="/" className='bg-btn-primary text-white px-4 py-2 rounded flex flex-row items-center font-semibold'>Start Raffling <ChevronRight className='ml-2 w-4 h-4' /></a>
                </div>
            </div>
        </>
    )
}
