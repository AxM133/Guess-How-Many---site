// Форму прячем, когда итоги уже опубликованы; пока данные грузятся — показываем заглушку
export const isGuessSectionVisible = (contest) => !contest?.result
export const isGuessSectionLoading = (contest) => !contest
