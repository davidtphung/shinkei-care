export type Screen = 'title' | 'notice' | 'cool' | 'pack' | 'seal' | 'ocean' | 'score'

export type CareItemId =
  | 'cooler'
  | 'ice'
  | 'label'
  | 'basket'
  | 'fish'
  | 'container'
  | 'tag'
  | 'seal'

export type NoticeId = 'cooler' | 'ice' | 'label' | 'basket' | 'fish'

export type PackId = 'ice' | 'label' | 'container' | 'tag'

export type NoticePuzzle = {
  id: string
  options: NoticeId[]
  answer: NoticeId
}

export type PackPuzzle = {
  items: PackId[]
}
