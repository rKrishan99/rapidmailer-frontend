import React from 'react'
import ToolCards from '../components/ToolCards';

const Tools = () => {
  return (
    <div className=' flex flex-col gap-6 p-8'>
      <div className=''>
        <h1 className='text-2xl font-bold'>Tools</h1>
      </div>
      <div>
        <ToolCards/>
      </div>
    </div>
  )
}

export default Tools;