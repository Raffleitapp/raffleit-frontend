import { Hero } from "../components/shared/Hero"
import { Started } from "../components/shared/Started"
import { Testimonials } from "../components/shared/Testimonials"

export const About = () => {
  return (
    <>
      <Hero
        title="About Us"
        subtitle="Get to know us better"
        linkText="How it works"
        linkHref="/howitworks"
        backgroundImage="/images/tb2.png"
      />
      <div className="container mx-auto mt-4 px-4">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-2/5">
            <img src="./images/active.png" alt="" className="w-full h-auto" />
          </div>
          <div className="w-full md:w-3/5 px-4 py-4">
            <h2 className="text-xl md:text-2xl font-bold">About Us</h2>
            <h3 className="text-base md:text-xl font-semibold">RafleIt has several benefits</h3>

            <p className="py-2">RaffleItApp was created with the idea that everyone can Do Good and Have Fun, and it aims to revolutionise the raffle platform for the twenty-first century by making it easier for anybody to operate a raffle from the comfort of their homes and places of employment.</p>

            <p className="py-2">Through the power of mobile connectivity, our internet platform connects people, businesses, organisations, clubs, charities, and more with a practically infinite audience. This provides everyone with an exciting option to make a difference, along with an accessible interface, to provide an engaging raffle experience both on and off-site.</p>

            <p className="py-2">We're pleased to participate in rewriting the rules of raffles while having fun by offering an effective and scalable solution for everyone to effortlessly hold raffles and reach customers.</p>
          </div>
        </div>
      </div>

      <div className="mt-8 px-4 py-4 bg-text-primary">
        <div className="mx-auto text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <h3 className="text-2xl font-bold">300</h3>
              <p className="text-sm">Fundraisers</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold">300k</h3>
              <p className="text-sm">Followers</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold">500</h3>
              <p className="text-sm">Winners</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold">$500k</h3>
              <p className="text-sm">Raised</p>
            </div>
          </div>
        </div>
      </div>

      <Testimonials />
      <Started />
    </>
  )
}
