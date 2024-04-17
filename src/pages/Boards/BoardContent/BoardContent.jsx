import Box from '@mui/material/Box'
import ListColumns from './ListColumns/ListColumns'
import { mapOrder } from '~/utils/sorts'
import { DndContext, useSensor, useSensors, MouseSensor, TouchSensor } from '@dnd-kit/core'
import { useEffect, useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'

function BoardContent({ board }) {
  // const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance : 10 } })

  //Nếu dùng PointerSensor thì phải kết hợp thuộc tính CSS touch-action: none ở những phần kéo thả
  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 10 } })

  //Nhấn giữ 250ms và dung sai của cảm ứng (dễ hiểu là di chuyển 500px) thì mới kích hoạt Event
  const touchSensor =useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 500 } })

  // const sensors = useSensors(pointerSensor)
  //Ưu tiên sử dụng kết hợp 2 loại sensors là mouse và touch để có trải nghiệm mobile tốt nhất, không bị bug
  const sensors = useSensors(mouseSensor, touchSensor)

  const [orderColumnsState, setorderColumnsState] = useState([])

  useEffect(() => {
    setorderColumnsState(mapOrder(board?.columns, board?.columnOrderIds, '_id'))
  }, [board])

  const handleDragEnd = (event) => {
    const { active, over } = event
    console.log('handleDragEnd', event)
    // Kiểm tra nếu không tồn tại over (kéo ra ngoài return luôn tránh lỗi)
    if (!over) return
    //Nếu vị trí sau khi kéo thả khác với vị trí ban đầu
    if (active.id !== over.id) {
      //Lấy vị trí cũ (từ thằng active)
      const oldIndex = orderColumnsState.findIndex(c => c._id == active.id)

      //Lấy vị trí mới (từ thằng over)
      const newIndex = orderColumnsState.findIndex(c => c._id == over.id)
      //Dùng arrayMove của thằng dnd-kit để sắp xếp lại mảng Columns ban đầu
      const dndOrderedColumn = arrayMove(orderColumnsState, oldIndex, newIndex)
      //Dung de xu ly API
      // const dndOrderedColumnIds = dndOrderedColumn.map(c => c._id)
      // console.log('dndOrderedColumnIds: ', dndOrderedColumnIds)
      // console.log('dndOrderColumn: ', dndOrderedColumn)

      //Cập nhật lại state columns ban đầu sau khi kéo thả
      setorderColumnsState(dndOrderedColumn)
    }
  }
  return (
    <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
      <Box sx={{
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2'),
        width: '100%',
        height: (theme) => theme.trello.boardContentHeight,
        p: '10px 0'
      }}>
        <ListColumns columns = {orderColumnsState}/>
      </Box>
    </DndContext>
  )
}

export default BoardContent
