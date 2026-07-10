import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Footer = () => {
  return (
    <footer className="mt-10 bg-black px-6 py-10 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 md:flex-row md:justify-around">
        {/* Logo */}
        <div className="flex flex-col justify-between gap-4">
          <img
            src="https://res-console.cloudinary.com/dvrqhwlyh/thumbnails/v1/image/upload/v1783491598/MDAyLW5pa2UtbG9nb3Mtc3dvb3NoLXdoaXRlX2d0ZWp4eQ==/drilldown"
            alt="Nike Logo"
            width={160}
          />

          <div className="mt-16 flex flex-col text-sm text-zinc-400">
            <span>© 2019 KAI STORE</span>
            <span>All Rights Reserved</span>
          </div>
        </div>

        {/* Information */}
        <div className="flex flex-col gap-4">
          <h3 className="font-bold">Information</h3>

          <Link href="#" className="transition font-light hover:text-zinc-300">
            Find a Store
          </Link>

          <Link href="#" className="transition font-light hover:text-zinc-300">
            Discount
          </Link>

          <Link href="#" className="transition font-light hover:text-zinc-300">
            Gift
          </Link>

          <Link href="#" className="transition font-light hover:text-zinc-300">
            Feedback
          </Link>

          <Link href="#" className="transition font-light hover:text-zinc-300">
            Become a Member
          </Link>
        </div>

        {/* Shop */}
        <div className="flex flex-col gap-4">
          <h3 className="font-bold">Shop</h3>

          <Link href="#" className="transition font-light hover:text-zinc-300">
            Nike
          </Link>

          <Link href="#" className="transition font-light hover:text-zinc-300">
            Adidas
          </Link>

          <Link href="#" className="transition font-light hover:text-zinc-300">
            MLB
          </Link>

          <Link href="#" className="transition font-light hover:text-zinc-300">
            Converse
          </Link>

          <Link href="#" className="transition font-light hover:text-zinc-300">
            Biti&apos;s
          </Link>
        </div>

        {/* About */}
        <div className="flex flex-col gap-4">
          <h3 className="font-bold">About</h3>

          <Link href="#" className="transition font-light hover:text-zinc-300">
            News
          </Link>

          <Link href="#" className="transition font-light hover:text-zinc-300">
            Contact
          </Link>
        </div>

        {/* Social */}
        <div className="flex gap-4">
          <Link href="#" aria-label="Twitter">
            <Avatar className="transition hover:scale-110">
              <AvatarImage
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8vXC1FeRM0ipD9muxYt58PKHMbpkfCSULj8Owlr6_b3E1XOAV8VU9t-Y&s=10"
                alt="Twitter"
                className="grayscale"
              />
              <AvatarFallback>TW</AvatarFallback>
            </Avatar>
          </Link>

          <Link href="#" aria-label="Facebook">
            <Avatar className="transition hover:scale-110">
              <AvatarImage
                src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/facebook-app-round-white-icon.png"
                alt="Facebook"
                className="grayscale"
              />
              <AvatarFallback>FB</AvatarFallback>
            </Avatar>
          </Link>

          <Link href="#" aria-label="Instagram">
            <Avatar className="transition hover:scale-110">
              <AvatarImage
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7tIEl5x79V7euRW3vg94hID6mcWVncbivrFcjMXvgdA&s=10"
                alt="Instagram"
                className="grayscale"
              />
              <AvatarFallback>IG</AvatarFallback>
            </Avatar>
          </Link>

          <Link href="#" aria-label="YouTube">
            <Avatar className="transition hover:scale-110">
              <AvatarImage
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqFZw8Oh1nl8OqibEchDBVQnTzR32CE79Ya2xElhge2Q&s=10"
                alt="YouTube"
                className="grayscale"
              />
              <AvatarFallback>YT</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
