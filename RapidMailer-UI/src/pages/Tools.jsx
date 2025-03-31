import React from 'react'
import ToolCards from '../components/ToolCards';
import { COLORS } from '../constants/theme';

const Tools = () => {
  return (
    <div style={{ backgroundColor: COLORS.secondary }} className=' flex flex-col w-full gap-6 p-8 h-full'>
      <div className=''>
        <h1 className='text-2xl font-bold'>Tools</h1>
      </div>
      <div className='overflow-hidden flex '>
        <ToolCards/>
      </div>
    </div>
  )
}

export default Tools;