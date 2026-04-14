declare global {
  interface Window {
    umami?: {
      track: (event: string, data?: Record<string, unknown>) => void
    }
  }
}

export const track = (event: string, data?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.umami) {
    window.umami.track(event, data)
  }
}

// 온보딩 퍼널
export const trackTestStart = () => track('test_start')
export const trackTestQuestion = (questionNumber: number) => track('test_question', { question: questionNumber })
export const trackTestComplete = () => track('test_complete')
export const trackCharacterAssigned = (characterType: string) => track('character_assigned', { character: characterType })
export const trackSignupPageView = () => track('signup_page_view')
export const trackSignupComplete = (characterType: string) => track('signup_complete', { character: characterType })

// 홈 기능
export const trackHomeVisited = () => track('home_visited')
export const trackAskButtonClick = () => track('ask_button_click')
export const trackConditionSelected = (condition: string) => track('condition_selected', { condition })
export const trackVerdictShown = (verdict: string) => track('verdict_shown', { verdict })
export const trackCtaClick = () => track('cta_click')

// 기록 퍼널
export const trackRecordTabClick = () => track('record_tab_click')
export const trackWorkoutSelected = (didWorkout: boolean) => track('workout_selected', { did_workout: didWorkout })
export const trackConditionInput = (score: number) => track('condition_input', { score })
export const trackMemoInput = () => track('memo_input')
export const trackCheckinComplete = (didWorkout: boolean, condition: number) => track('checkin_complete', { did_workout: didWorkout, condition })

// 마이페이지
export const trackMypageVisited = () => track('mypage_visited')
export const trackRetestClick = () => track('retest_click')