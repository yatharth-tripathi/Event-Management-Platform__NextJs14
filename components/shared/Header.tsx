import Image from 'next/image'
import Link from 'next/link'
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { Button } from '@/components/ui/button';
import NavItems from './NavItems';
import MobileNav from './MobileNav';

const Header = () => {
  return (
    <header className='w-full border-b' >
      <div className='max-w-7xl lg:mx-auto p-5 md:px-10 xl:px-0 w-full flex items-center justify-between'>
        <Link href='/' className='flex items-center select-none w-36 '>
          <Image
            src='/assets/images/logo.png'
            width={38} height={38}
            alt='Eventify logo'
          />
          <p className='font-bold text-md '>Eventify RCOEM</p>
        </Link>

        <SignedIn>
          <nav className="md:flex justify-between items-center hidden w-full max-w-xs">
            <NavItems />
          </nav>
        </SignedIn>

        <div className='flex justify-end w-32 gap-3'>

          <div className="flex w-32 justify-end gap-3">
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
              <MobileNav />
            </SignedIn>
            <SignedOut>
              <Button asChild className="rounded-full" size="lg">
                <Link href="/sign-in">
                  Login
                </Link>
              </Button>
            </SignedOut>
          </div>

        </div>
      </div>
    </header>
  )
}

export default Header
