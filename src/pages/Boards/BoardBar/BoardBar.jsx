import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import DashboardIcon from '@mui/icons-material/Dashboard'
import VpnLockIcon from '@mui/icons-material/VpnLock'
import AddToDriveIcon from '@mui/icons-material/AddToDrive'
import BoltIcon from '@mui/icons-material/Bolt'
import FilterListIcon from '@mui/icons-material/FilterList'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1'
import { capitalizeFirstLetter } from '~/utils/formatters'
const MENU_STYLE = {
  color: 'white',
  bgcolor: 'transparent',
  border: 'none',
  paddingX: '5px',
  borderRadius: '4px',
  '.MuiSvgIcon-root': {
    color: 'white'
  },
  '&:hover':{
    bgcolor: 'primary.50'
  }
}

function BoardBar({ board }) {
  return (
    <Box sx={{
      width: '100%',
      height: (theme) => theme.trello.boardBarHeight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
      paddingX: 2,
      overflowX: 'auto',
      borderTop: '1px solid #B3C8CF',
      bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2'),
      '&::-webkit-scrollbar-track': { m: 2 }
    }}>
      <Box sx={{ display: 'flex', alignItems:'center', gap: 2 }}>
        <Chip sx={MENU_STYLE}
          icon={<DashboardIcon />}
          label= {board?.title}
          clickable/>

        <Chip sx={MENU_STYLE}
          icon={<VpnLockIcon />}
          label={capitalizeFirstLetter(board?.type)}
          clickable/>

        <Chip sx={MENU_STYLE}
          icon={<AddToDriveIcon />}
          label="Add to Google Drive"
          clickable/>

        <Chip sx={MENU_STYLE}
          icon={<BoltIcon />}
          label="Automation"
          clickable/>

        <Chip sx={MENU_STYLE}
          icon={<FilterListIcon />}
          label="Filter"
          clickable/>
      </Box>

      <Box sx={{ display: 'flex', alignItems:'center', gap: 2 }}>
        <Button
          variant="outlined"
          sx={{
            color: 'white',
            borderColor: 'white',
            '&:hover': { borderColor: 'white' }
          }}
          startIcon={<PersonAddAlt1Icon/>}>
          Invite
        </Button>
        <AvatarGroup max={7}
          sx={{
            gap:'10px',
            '& .MuiAvatar-root':{
              width:34,
              height:34,
              fontSize: 16,
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              '&:first-of-type': { bgcolor: '#a4b0be' }
            }
          }}
        >
          <Tooltip title="customer-1">
            <Avatar alt="customer 1" src="src\assets\customer.jpg" />
          </Tooltip>
          <Tooltip title="customer-1">
            <Avatar alt="customer 1" src="src\assets\customer.jpg" />
          </Tooltip>
          <Tooltip title="customer-1">
            <Avatar alt="customer 1" src="src\assets\customer.jpg" />
          </Tooltip>
          <Tooltip title="customer-1">
            <Avatar alt="customer 1" src="src\assets\customer.jpg" />
          </Tooltip>
          <Tooltip title="customer-1">
            <Avatar alt="customer 1" src="src\assets\customer.jpg" />
          </Tooltip>
          <Tooltip title="customer-1">
            <Avatar alt="customer 1" src="src\assets\customer.jpg" />
          </Tooltip>
          <Tooltip title="customer-1">
            <Avatar alt="customer 1" src="src\assets\customer.jpg" />
          </Tooltip>
          <Tooltip title="customer-1">
            <Avatar alt="customer 1" src="src\assets\customer.jpg" />
          </Tooltip>
          <Tooltip title="customer-1">
            <Avatar alt="customer 1" src="src\assets\customer.jpg" />
          </Tooltip>
          <Tooltip title="customer-1">
            <Avatar alt="customer 1" src="src\assets\customer.jpg" />
          </Tooltip>
          <Tooltip title="customer-1">
            <Avatar alt="customer 1" src="src\assets\customer.jpg" />
          </Tooltip>
          <Tooltip title="customer-1">
            <Avatar alt="customer 1" src="src\assets\customer.jpg" />
          </Tooltip>
        </AvatarGroup>
      </Box>
    </Box>
  )
}

export default BoardBar
