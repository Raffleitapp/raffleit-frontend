
export const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 container mx-auto px-2">
                <div className="col-span-1 ml-4">
                    <h2 className="text-lg font-bold">Funditzone</h2>
                    <p className="text-sm">
                        Raffleit provides opportunities to raise funds for business,Individuals and Organizations giving them a wide range of opportunities to raffle items or own items once they have taken part in the raffle.
                    </p>
                </div>
                <div className="col-span-1 ml-4">
                    <h2 className="text-lg font-bold">Quick Links</h2>
                    <a href="/">Home</a>
                    <br />
                    <a href="/about">About</a>
                    <br />
                    <a href="/contact">Contact</a>
                    <br />
                    <a href="/howitworks">How it works</a>
                    <br />
                    <a href="/terms">Terms of Service</a>
                    <br />
                    <a href="/privacy">Privacy Policy</a>
                </div>
                <div className="col-span-1 ml-4">
                    <h2 className="text-lg font-bold">Contact Us</h2>
                    <p className="text-sm">Email: info@funditzone.com</p>
                    <p className="text-sm">Phone: +1 234 567 890</p>
                    <p className="text-sm">Address: 123 Raffleit St, City, Country</p>
                </div>
                <div className="col-span-1 ml-4">
                    <h2 className="text-lg font-bold">Follow Us</h2>
                    <a href="https://www.facebook.com" className="text-sm">Facebook</a>
                    <br />
                    <a href="https://www.twitter.com" className="text-sm">Twitter</a>
                    <br />
                    <a href="https://www.instagram.com" className="text-sm">Instagram</a>
                    <br />
                    <a href="https://www.linkedin.com" className="text-sm">LinkedIn</a>
                    <br />
                    <a href="https://www.youtube.com" className="text-sm">YouTube</a>
                </div>
            </div>
            <hr className="mt-4 py-2 px-2 w-95/100 mx-auto" />
            <div className="container mx-auto text-center py-2 px-2">
                <p className="text-sm">
                    &copy; {new Date().getFullYear()} Funditzone. All rights reserved.
                </p>
            </div>
        </footer >
    )
}
