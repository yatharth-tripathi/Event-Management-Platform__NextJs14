import React from 'react'
import Link from 'next/link'
import Image from 'next/image'


const Footer = () => {
  return (
    <footer className='border-t'>
      <div className='w-full flex flex-col sm:flex-row items-center justify-between max-w-7xl  p-5 md:px-10 xl:px-0 gap-4 text-center '>
        <Link href='/' className='flex items-center select-none w-36 '>
          <Image
            src='/assets/images/logo.png'
            width={38} height={38}
            alt='Eventify logo'
          />
          <p className='font-bold text-md '>Eventify</p>
        </Link>

        <p>2025 Eventify. All Rights Reversed</p>
      </div>

    </footer>
  )
}

export default Footer