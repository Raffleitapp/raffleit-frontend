import '../assets/css/main.css';

export const Home = () => {
  return (
    <>
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
      <div className="container mx-auto py-4 px-4">
        <div className="text-center md:mt-20 mt-10 mb-4 w-full md:w-70/100 mx-auto">
          <h2 className="text-2xl font-bold mb-4">Get Started Today!</h2>
          <p className="text-base">RaffleItApp connects your raffle to persons and donors outside of your community so they can take part in the raffle or donate remotely to your cause. Revolutionize raffles and fundraising!</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-items-center gap-4">
          <div className="col-span-1 shadow-lg rounded-xl w-full px-4 py-4 mt-4 mb-4">
            <h1 className="relative inline-block"><span className="rounded-full bg-text-primary text-white font-bold px-4.5 py-3.5 text-sm">1</span></h1>
            <h2 className="font-bold mt-2 text-xl text-text-primary py-2 px-2">Create</h2>
            <p className="py-2 px-2 text-gray-500">Nonprofits and charities can create an account by clicking here or by downloading the raffleit app on IOS | Google Play</p>
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
      </div>
    </>
  )
}
