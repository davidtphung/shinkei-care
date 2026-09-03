export type Screen = 'title' | 'spike' | 'gill' | 'ice' | 'seal' | 'rest' | 'score'

export type CareItemId =
  | 'cooler'
  | 'ice'
  | 'label'
  | 'basket'
  | 'fish'
  | 'container'
  | 'tag'
  | 'seal'
  | 'brain'
  | 'gill'

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

export type SpikeTiming = 'early' | 'late' | 'high' | 'hit'

export type GillResult = 'hit' | 'high' | 'miss'
