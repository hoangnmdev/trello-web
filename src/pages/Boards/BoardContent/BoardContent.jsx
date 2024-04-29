import Box from '@mui/material/Box'
import ListColumns from './ListColumns/ListColumns'
import { mapOrder } from '~/utils/sorts'
import { DndContext,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  DragOverlay,
  defaultDropAnimationSideEffects,
  pointerWithin,
  closestCorners,
  getFirstCollision
} from '@dnd-kit/core'
import { useEffect, useState, useCallback, useRef } from 'react'
import { arrayMove } from '@dnd-kit/sortable'

import Column from './ListColumns/Column/Column'
import Card from './ListColumns/Column/ListCards/Card/Card'
import { cloneDeep } from 'lodash'
const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: 'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD: 'ACTIVE_DRAG_ITEM_TYPE_CARD'
}

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
  //Cùng 1 thời điểm, chỉ có 1 phần tử được kéo, column hoặc là card
  const [activeDragItemId, setActiveDragItemId] = useState(null)
  const [activeDragItemType, setActiveDragItemType] = useState(null)
  const [activeDragItemData, setActiveDragItemData] = useState(null)
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] = useState(null)

  // Điểm va chạm cuối cùng (xử lý thuật toán phát hiện va chạm)
  const lastOverId = useRef(null)
  useEffect(() => {
    setorderColumnsState(mapOrder(board?.columns, board?.columnOrderIds, '_id'))
  }, [board])
  //Tìm một cái Column theo CardId
  const findColumnByCardId = (cardId) => {
    /* Đoạn này cần lưu ý, nên dùng c.cards thay vì c.cardOrderIds bởi vi ở bước handleDragOver chúng ta sé
    làm dữ liệu cho cards hoàn chỉnh trước rồi mới tạo ra cardOrderIds mới
  */
    return orderColumnsState.find(column => column.cards.map(card => card._id)?.includes(cardId))
  }
  //Trigger khi kéo (drag) một phần tử
  const handleDragStart = (event) => {
    // console.log('handleDragStart', event)
    setActiveDragItemId(event?.active?.id)
    setActiveDragItemType(event?.active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN)
    setActiveDragItemData(event?.active?.data?.current)

    // Nếu là kéo card thì mới thực hiện hành động giá trị oldColumn
    if (event?.active?.data?.current?.columnId) {
      setOldColumnWhenDraggingCard(findColumnByCardId(event?.active?.id))
    }
  }
  // Function chung xử lý việc cập nhật lại state trong trường hợp di chuyển Card giữa các Column khác nhau
  const moveCardBetweenDifferentColumns = (
    overColumn,
    overCardId,
    active,
    over,
    activeColumn,
    activeDraggingCardId,
    activeDraggingCardData
  ) => {
    setorderColumnsState(prevColumns => {
    // Tìm vị trí (index) của cái overCard trong column đích (nơi mà activeCard sắp được thả )
      const overCardIndex = overColumn?.cards?.findIndex(card => card._id === overCardId)

      // Logic tính toán "cardIndex mới" (trên hoặc dưới của overCard) lấy chuẩn ra từ code của thư viện
      let newCardIndex
      const isBelowOverItem = active.rect.current.translated &&
    active.rect.current.translated.top > over.rect.top + over.rect.height

      const modifier = isBelowOverItem ? 1 : 0
      newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overColumn?. cards?.length + 1

      //Clone mảng OrderColumnsState cũ ra một cái mới để xử lý data rồi return - cập nhật lại OrderedColumnsState mới
      const nextColumns = cloneDeep(prevColumns)

      const nextActiveColumn = nextColumns.find(column => column._id === activeColumn._id)
      const nextOverColumn = nextColumns.find(column => column._id === overColumn._id)
      //Column cũ
      if (nextActiveColumn) {
      // Xóa card ở cái column active (cũng có thể hiểu là column cũ, cái lúc mà kéo card ra khỏi nó để sang column khác)
        nextActiveColumn.cards = nextActiveColumn.cards.filter(card => card._id !== activeDraggingCardId)

        // Cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
        nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(card => card._id)
      }
      //Column mới
      if (nextOverColumn) {
      //Kiểm tra xem card đang kéo nó có tồn tại ở overColumn chưa, nếu có thì cần xóa nó trước
        nextOverColumn.cards = nextOverColumn.cards.filter(card => card._id !== activeDraggingCardId)

        // Đối với trường hợp dragEnd thì phải cập nhật lại chuẩn dữ liệu columnId trong card sau khi kéo card giữa 2 column khác nhau
        const rebuild_activeDraggingCardData = {
          ...activeDraggingCardData,
          columnId: nextOverColumn._id
        }
        // Tiếp theo là thêm cái card đang kéo vào overColumn theo vị trí index mới
        nextOverColumn.cards = nextOverColumn.cards.toSpliced(newCardIndex, 0, rebuild_activeDraggingCardData)

        // Cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
        nextOverColumn.cardOrderIds = nextOverColumn.cards.map(card => card._id)

      }
      return nextColumns
    })
  }
  // Trigger trong quá trình kéo (drag) một phần tử => hành động kéo thả (drop)
  const handleDragOver = (event) => {
    // Không làm gì thêm nếu đang kéo Column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return

    // console.log('handleDragOver: ', event)

    // Còn nếu kéo card thì xử lý thêm để có thể kéo card qua lại giữa các columns
    const { active, over } = event

    //Cần đảm bảo nếu không tồn tại active hoặc over (Khi kéo ra khỏi phạm vi container) thì không làm gì (tránh crash trang)
    if (!active || !over) return

    //activeDraggingCard: là cái card đang được kéo
    const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
    // overCard: là cái card đang tương tác trên hoặc dưới so với cái card được kéo ở trên
    const { id: overCardId } = over

    //Tìm 2 cái columns theo cardId
    const activeColumn = findColumnByCardId(activeDraggingCardId)
    const overColumn = findColumnByCardId(overCardId)

    //Nếu không tồn tại 1 trong 2 column thì không làm gì hết
    if (!activeColumn || !overColumn) return

    // Xử lý logic ở đây chỉ khi kéo card qua 2 column khác nhau, còn nếu kéo card trong chính column ban đầu của nó thì không làm gì
    // Vì đây là đang là đoạn xử lý lúc kéo (handleDragOver), còn xử lý lúc kéo xong xuôi thì nó lại là vấn đề khác ở (handDragEnd)
    if (activeColumn._id !== overColumn._id) {
      moveCardBetweenDifferentColumns( overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeDraggingCardId,
        activeDraggingCardData)
    }
  }
  //Trigger khi kết thúc hành động kéo một phần tử => hành động thả (drop)
  const handleDragEnd = (event) => {
    // console.log('handleDragEnd: ', event)
    const { active, over } = event

    //Cần đảm bảo nếu không tồn tại active hoặc over (Khi kéo ra khỏi phạm vi container) thì không làm gì (tránh crash trang)
    if (!active || !over) return

    // Xử lý kéo thả Cards
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {

      //activeDraggingCard: là cái card đang được kéo
      const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active

      // overCard: là cái card đang tương tác trên hoặc dưới so với cái card được kéo ở trên
      const { id: overCardId } = over

      //Tìm 2 cái columns theo cardId
      const activeColumn = findColumnByCardId(activeDraggingCardId)
      const overColumn = findColumnByCardId(overCardId)

      //Nếu không tồn tại 1 trong 2 column thì không làm gì hết
      if (!activeColumn || !overColumn) return

      // Hành động kéo thả card giữa 2 column khác nhau
      /* Phải dùng tới activeDragItemData.columnId hoặc oldColumnDraggingCard._id (set vào state từ bước handleDragStart)
      chứ không phải activeData trong scope handleDragEnd này vì sau khi đi qua onDragOver tới đây là state đã bị cập nhật một lần rồi
      */
      if (oldColumnWhenDraggingCard._id !== overColumn._id) {
        moveCardBetweenDifferentColumns( overColumn,
          overCardId,
          active,
          over,
          activeColumn,
          activeDraggingCardId,
          activeDraggingCardData)
      } else {
        // Hành động kéo thả card trong cùng một cái column

        //Lấy vị trí cũ (từ thằng oldColumnWhenDraggingCard)
        const oldCardIndex = oldColumnWhenDraggingCard?.cards?.findIndex(c => c._id == activeDragItemId)

        //Lấy vị trí mới (từ thằng overColumn)
        const newCardIndex = oldColumnWhenDraggingCard?.cards?.findIndex(c => c._id == overCardId)

        // Dùng arrayMove vì kéo card trong một cái column thì tương tự với logic kéo column trong một cái board content
        const dndOrderedCards = arrayMove(oldColumnWhenDraggingCard?.cards, oldCardIndex, newCardIndex)

        setorderColumnsState(prevColumns => {
        //Clone mảng OrderedColumnsState cũ ra một cái mới để xử lý data rồi return - cập nhật lại OrderedColumnsState mới
          const nextColumns = cloneDeep(prevColumns)

          // Tìm tới cái Column mà chúng ta đang thả
          const targetColumn = nextColumns.find(column => column._id === overColumn._id)

          // Cập nhật lại 2 giá trị mới là card và cardOrderIds trong cái targetColumn
          targetColumn.cards = dndOrderedCards
          targetColumn.cardOrderIds = dndOrderedCards.map(card => card._id)

          // Trả về giá trị state mới (chuẩn vị trí)
          return nextColumns
        })
      }

    }
    // Xử lý kéo thả Column trong một cái boardContent
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
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

    // Những dữ liệu sau khi kéo thả này luôn phải đưa về giá trị null mặc định ban đầu
    setActiveDragItemId(null)
    setActiveDragItemData(null)
    setActiveDragItemType(null)
    setOldColumnWhenDraggingCard(null)
  }
  /**
   * Animation khi thả (Drop) phần tử - Test bằng cách kéo xong thả trực tiếp và nhìn phần giữ chỗ Overlay(video 32)
   */
  const customDropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } })
  }

  // Chúng ta sẽ custom lại chiến lược / thuật toán phát hiện va chạm tối ưu cho việc kéo thả card giữa nhiều columns (video 37 fix bug quan trọng)
  // args = arguments = Các Đối số, tham số
  const collisionDetectionStrangegy = useCallback((args) => {
    // Trường hợp kéo column thì dùng thuật toán closesCorner là chuẩn nhất
    if (activeDragItemType ===ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      return closestCorners({ ...args })
    }
    // Tìm điểm giao nhau, va chạm - intersection với con trỏ
    const pointerIntersections = pointerWithin(args)
    // console.log('pointerIntersections: ', pointerIntersections)

    // Nếu pointerIntersections là mảng rỗng, return luôn không làm gì hết
    // Fix triệt để cái bug flickering của thư viện Dnd-kit trong trường hợp sau:
    // Kéo một card có image cover lớn và kéo lên phía trên cùng ra khỏi khu vực kéo thả
    if (!pointerIntersections?.length) return

    // Thuật toán phát hiện va chạm sẽ trả về một mảng các va chạm ở đây
    // const intersections = pointerIntersections?.length > 0
    //   ?pointerIntersections
    //   : rectIntersection(args)

    // Tìm overId đàu tiên trong intersections
    let overId = getFirstCollision(pointerIntersections, 'id')

    if (overId) {

      /**
       * Nếu cái over nó là column thì sẽ tìm tới cái cardId gần nhất bên trong khu vực va chạm đó dựa vào thuật toán
       * phát hiện va chạm closestCenter hoặc closestCorners đều được. Tuy nhiên ở đây dùng closestCenter sẽ mượt mà hơn
       * */
      const checkColumn = orderColumnsState.find(column => column._id === overId)
      if (checkColumn) {
        // console.log('overId before: ', overId )
        overId = closestCorners({
          ...args,
          droppableContainers: args.droppableContainers.filter(container => {
            return (container.id !== overId) && (checkColumn?.cardOrderIds?.includes(container.id))
          })
        })[0]?.id
      }
      lastOverId.current = overId
      // console.log('overId after: ', overId )
      return [{ id: overId }]
    }

    return lastOverId.current ? [{ id: lastOverId.current }] : []
  }, [activeDragItemType, orderColumnsState])
  return (
    <DndContext
      // Cảm biến (đã giải thích ở video số 30)
      sensors={sensors}
      /* Thuật toán phát hiện va chạm (nếu không có nó thì card với cover lớn sẽ không kéo qua Column được
      vì lúc này nó đang bị conflict giữa card và column), chúng ta sẽ dùng closetCorners thay vì closetCenter
      */
      //Update video 37: nếu chỉ có dùng cloestCorners sẽ có bug flickering + sai lệch dữ liệu (vui lòng xem video 37 sẽ rõ)
      //Update video 37: Nếu chỉ dùng
      // collisionDetection={closestCorners}
      collisionDetection = {collisionDetectionStrangegy}

      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <Box sx={{
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2'),
        width: '100%',
        height: (theme) => theme.trello.boardContentHeight,
        p: '10px 0'
      }}>
        <ListColumns columns = {orderColumnsState}/>
        <DragOverlay dropAnimation={customDropAnimation}>
          {(!activeDragItemType) && null}
          {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) && <Column column={activeDragItemData}/>}
          {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) && <Card card={activeDragItemData}/>}
        </DragOverlay>
      </Box>
    </DndContext>
  )
}

export default BoardContent
