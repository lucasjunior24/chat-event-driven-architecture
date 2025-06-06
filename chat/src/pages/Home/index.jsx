import './styles.scss';

import { IoMdSearch } from 'react-icons/io';
import DirectMessages from './DirectMessages';
import { useState } from 'react';
import Display from './Display';
import useUser from 'hooks/user';
export default function Home() {
  const [filter, setFilter] = useState('');
  const { name } = useUser();
  return (
    <div className='home-container'>
      <div className='home-chat-container'>
        <h1 className='home-chat-title'>Chat - {name}</h1>
        <div className='home-chat-input'>
          <input
            placeholder='Buscar'
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <IoMdSearch className='home-chat-input-icon' />
        </div>
        <div className='home-chat-content'>
          <DirectMessages filter={filter} />
        </div>

      </div>
      <Display />
    </div>
  );
}
