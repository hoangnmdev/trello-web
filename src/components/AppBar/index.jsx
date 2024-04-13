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

function AppBar() {
  return (
    <Box sx={{
      width: '100%',
      height: (theme) => theme.trello.appBarHeight,
      display: 'flex',
      paddingX: 2,
      alignItems: 'center',
      justifyContent: 'space-between',
      overflowX: 'auto'
    }}>
      <Box sx={{ display: 'flex', alignItems:'center', gap: 2 }}>
        <AppsIcon sx = {{ color: 'primary.main' }}/>
        <Box sx={{ display: 'flex', alignItems:'center', gap: 0.5 }}>
          <SvgIcon component={TrelloIcon} inheritViewBox sx ={{ color: 'primary.main', width:'15px', height: '15px' }}/>
          <Typography variant="span" fontSize={'1.2rem'} fontWeight={'bold'} color={'primary.main'}>Trello</Typography>
        </Box>

        <Box sx={{ display: { xs:'none', md: 'flex' }, gap: 1 }}>
          <Workspace/>
          <Recent/>
          <Starred/>
          <Template/>
          <Button variant="outlined" startIcon = {<LibraryAddIcon/>}>Create</Button>
        </Box>

      </Box>

      <Box sx={{ display: 'flex', alignItems:'center', gap: 2 }}>
        <TextField id="outlined-search" label="Search..." type="search" size='small' sx={{ minWidth: '120px' }}/>
        <ModeSelect/>

        <Tooltip title="Notification">
          <Badge color="secondary" variant="dot" sx={{ cursor: 'pointer' }}>
            <NotificationsNoneIcon sx={{ color: 'primary.main' }}/>
          </Badge>
        </Tooltip>

        <Tooltip title="Notification" sx={{ cursor: 'pointer' }}>
          <HelpOutlineIcon sx={{ color: 'primary.main' }}/>
        </Tooltip>

        <Profile/>
      </Box>

    </Box>
  )
}

export default AppBar
