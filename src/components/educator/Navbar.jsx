import React from 'react'
import { dummyEducatorData, assets } from '../../assets/assets'
import { UserButton, useUser } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'

const NavBar = () => {
  const educatorData = dummyEducatorData
  const { user } = useUser()

  return (
    <div className='flex items-center justify-between px-4 md:px-8 border-b border-gray-500 py-3'>
      <Link to={'/'}>
      <img src={assets.logo} alt="" className='w-28 lg:w-32 cursor-pointer transition-transform duration-300 ease-in-out hover:scale-110 hover:rotate-3 hover:drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]' />
      </Link>
      <div className='flex items-center gap-5 text-gray-500 relative'>
        <p>Hi! {user ? user.fullName: 'Developers'}</p>
        {user ? <UserButton /> : <img className='max-w-8' src={assets.profile_img} />}
      </div>
    </div>
  )
}

export default NavBar