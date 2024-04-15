import { useState } from 'react'
import ModeSelect from '~/components/ModeSelect'
import Box from '@mui/material/Box'
import AppsIcon from '@mui/icons-material/Apps'
import { ReactComponent as TrelloIcon } from '~/assets/trello-icon.svg'
import SvgIcon from '@mui/material/SvgIcon'
import Typography from '@mui/material/Typography'
import Workspace from './Menus/Workspace'
import Recent from './Menus/Recent'
import Starred from './Menus/Starred'
import Template from './Menus/Template'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import Badge from '@mui/material/Badge'
import Tooltip from '@mui/material/Tooltip'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import Profile from './Menus/Profiles'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'

function AppBar() {
  const [searchValue, setSearchValue] = useState('')
  return (
    <Box sx={{
      width: '100%',
      height: (theme) => theme.trello.appBarHeight,
      display: 'flex',
      paddingX: 2,
      alignItems: 'center',
      justifyContent: 'space-between',
      overflowX: 'auto',
      bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#222831' : '#1565c0'),
      '&::-webkit-scrollbar-track': { m: 2 }
    }}>
      <Box sx={{ display: 'flex', alignItems:'center', gap: 2 }}>
        <AppsIcon sx = {{ color: 'white' }}/>
        <Box sx={{ display: 'flex', alignItems:'center', gap: 0.5 }}>
          <SvgIcon component={TrelloIcon} inheritViewBox sx ={{ color: 'white', width:'15px', height: '15px' }}/>
          <Typography variant="span" fontSize={'1.2rem'} fontWeight={'bold'} color={'white'}>Trello</Typography>
        </Box>

        <Box sx={{ display: { xs:'none', md: 'flex' }, gap: 1 }}>
          <Workspace/>
          <Recent/>
          <Starred/>
          <Template/>
          <Button
            sx={{ color: 'white',
              border: 'none',
              '&:hover': { border: 'none' }
            }}
            variant="outlined"
            startIcon = {<LibraryAddIcon/>}>
            Create
          </Button>
        </Box>

      </Box>

      <Box sx={{ display: 'flex', alignItems:'center', gap: 2 }}>
        <TextField
          id="outlined-search"
          label="Search..."
          type="text"
          size='small'
          value = {searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'white' }}/>
              </InputAdornment>
            ),
            endAdornment: (
              <CloseIcon fontSize='small'
                sx={{ color: searchValue ? 'white': 'transparent', cursor: 'pointer' }}
                onClick = {() => setSearchValue('')}
              />
            )
          }}

          sx={{
            minWidth: '120px',
            maxWidth: '170px',
            '& label':{ color: 'white' },
            '& input':{ color: 'white' },
            '& label.Mui-focused': { color: 'white' },
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: 'white' },
              '&:hover fieldset': { borderColor: 'white' },
              '&.Mui-focused fieldset': { borderColor: 'white' }

            }
          }}/>
        <ModeSelect/>

        <Tooltip title="Notification">
          <Badge color="warning" variant="dot" sx={{ cursor: 'pointer' }}>
            <NotificationsNoneIcon sx={{ color: 'white' }}/>
          </Badge>
        </Tooltip>

        <Tooltip title="Notification" sx={{ cursor: 'pointer' }}>
          <HelpOutlineIcon sx={{ color: 'white' }}/>
        </Tooltip>

        <Profile/>
      </Box>

    </Box>
  )
}

export default AppBar
