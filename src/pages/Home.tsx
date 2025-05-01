import '../assets/css/main.css';
import { ChevronRight } from 'lucide-react';
import { Hero } from '../components/shared/Hero';
import { Started } from '../components/shared/Started';
import { Testimonials } from '../components/shared/Testimonials';

export const Home = () => {
  return (
    <>
      <Hero
        backgroundImage='./images/home-bg.png'
        title='Raffle From Anywhere Around The World'
        subtitle='Raffleit provides opportunities to raise funds for business or even to give persons a wide range of opportunity to raffle items or own items once you have taken part in the raffle.'
        linkText="How it works"
        linkHref='/howitworks'
        height={80}
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

      <div className="bg-text-primary my-8 mx-auto px-4 py-4">
        <h2 className="text-4xl font-bold text-center text-btn-primary mb-6">Raffleit <span className='text-white'>Collections</span></h2>
        <p className="text-base text-gray-300 text-center mb-8">
          Raffleit provides opportunities to raise funds for business, individuals and organizations, or even to give persons a wide range of opportunities to raffle items or own items once you have taken part in the raffle.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex flex-col items-center justify-center p-4 border border-gray-600 rounded shadow-md bg-gray-800">
            <h3 className="text-xl font-semibold text-btn-primary mb-2">Live Draws</h3>
          </div>
          <div className="flex flex-col items-center justify-center p-4 border border-gray-600 rounded shadow-md bg-gray-800">
            <h3 className="text-xl font-semibold text-btn-primary mb-2">Business</h3>
          </div>
          {/* <div className="flex flex-col items-center justify-center p-4 border border-gray-600 rounded shadow-md bg-gray-800">
            <h3 className="text-xl font-semibold text-btn-primary mb-2">Non-Profit</h3>
          </div> */}
          <div className="flex flex-col items-center justify-center p-4 border border-gray-600 rounded shadow-md bg-gray-800">
            <h3 className="text-xl font-semibold text-btn-primary mb-2">Fundraising</h3>
          </div>
        </div>
      </div>
      <Testimonials />
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
