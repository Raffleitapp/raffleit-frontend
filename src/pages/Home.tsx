import '../assets/css/main.css';
import { ChevronRight } from 'lucide-react';
import { Hero } from '../components/shared/Hero';
import { Started } from '../components/shared/Started';

export const Home = () => {
  return (
    <>
      <Hero
        backgroundImage='./images/home-bg.png'
        title='Raffle From Anywhere Around The World'
        subtitle='Raffleit provides opportunities to raise funds for business or even to give persons a wide range of opportunity to raffle items or own items once you have taken part in the raffle.'
        linkText="How it works"
        linkHref='/howitworks'
        height={75}
      />
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center justify-center mt-4">
          <div className="w-full md:w-3/4 mx-auto p-4">
            <img src="./images/active.png" alt="" />
          </div>
          <div className="flex flex-col items-center justify-center px-4 py-4" >
            <h1 className="text-5xl font-bold text-black">How raffleit <span className="text-btn-primary">works</span></h1>
            <div className="grid grid-cols-2 gap-4 px-4 py-4 mt-4">
              <div className="col-span-1">
                <h2 className="text-xl font-bold text-text-primary mt-4">50% of the total</h2>
                <p className="text-base text-gray-500 mt-2">The winner gets the price, the person or company who issues the raffle receives 50% of the total</p>
              </div>
              <div className="col-span-1">
                <h2 className="text-xl font-bold text-text-primary mt-4">Easy Setup</h2>
                <p className="text-base text-gray-500 mt-2">Set up is free and can be done in a few minutes from the comfort of your home or office</p>
              </div>
              <div className="col-span-1">
                <h2 className="text-xl font-bold text-text-primary mt-4">Support</h2>
                <p className="text-base text-gray-500 mt-2">RaffleIt App ensures people everywhere, support your cause without taking part in the raffle.</p>
              </div>
              <div className="col-span-1">
                <h2 className="text-xl font-bold text-text-primary mt-4">Door step delivery</h2>
                <p className="text-base text-gray-500 mt-2">Set up is free and can be done in a few minutes from the comfort of your home or office</p>
              </div>
            </div>
            <a href="/" className='bg-btn-primary text-white px-4 py-2 rounded flex flex-row items-center font-semibold'>Read More <ChevronRight className='ml-2 w-4 h-4' /></a>
          </div>
        </div>
      </div>
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
            <p className="py-2 px-2 text-gray-500 italic">"RaffleItApp made fundraising so easy and effective for our organization. We reached donors we never thought possible!"</p>
            <div className="flex items-center mt-4">
              <span className="text-yellow-500">★★★★★</span>
            </div>
            <h2 className="font-bold mt-2 text-xl text-text-primary py-2 px-2">- John Doe</h2>
          </div>
          <div className="col-span-1 shadow-lg rounded-xl w-full px-4 py-4 mt-4 mb-4">
            <div className="relative">
              <span className="absolute top-0 left-0 text-4xl text-btn-primary font-bold">“</span>
            </div>
            <p className="py-2 px-2 text-gray-500 italic">"Sharing our raffle was seamless, and the support we received was incredible. Highly recommend RaffleItApp!"</p>
            <div className="flex items-center mt-4">
              <span className="text-yellow-500">★★★★★</span>
            </div>
            <h2 className="font-bold mt-2 text-xl text-btn-primary py-2 px-2">- Jane Smith</h2>
          </div>
          <div className="col-span-1 shadow-lg rounded-xl w-full px-4 py-4 mt-4 mb-4">
            <div className="relative">
              <span className="absolute top-0 left-0 text-4xl text-btn-primary font-bold">“</span>
            </div>
            <p className="py-2 px-2 text-gray-500 italic">"Watching our donations grow in real-time was a game-changer. RaffleItApp is the future of fundraising!"</p>
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
      <div className="bg-text-primary w-full">
        <div className="container mx-auto flex items-center flex-col md:flex-row justify-items-center gap-4 py-4 px-4">
          <div className="flex flex-col items-start justify-center w-full md:w-7/10">
            <h1 className="text-4xl md:text-5xl font-semibold text-btn-primary">How <span className="text-white font-bold">raffleit</span> attracts individual</h1>
            <p className="text-base text-white mt-4">RaffleItApp connects your raffle to persons and donors outside of your community so they can take part in the raffle or donate remotely to your cause. Revolutionize raffles and fundraising!</p>
          </div>
          <div className="mx-auto">
            <img src="./images/online-connect.png" alt="" className="w-30 h-auto md:h-auto md:w-auto connect" />
          </div>
        </div>
      </div>
      <Started />
    </>
  )
}
