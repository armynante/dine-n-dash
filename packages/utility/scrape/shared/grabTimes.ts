const BUTTON_SELECTO = "ReservationButton Button Button--primary"

export const grabTimes = async (page: any) => {
  // @ts-ignore
  const buttonIds = await page.$$eval(`button[class='${BUTTON_SELECTO}']`, buttons => {
    // @ts-ignore
    return buttons.map(btn => {
      const id = btn.id;
      const time = btn?.firstChild?.textContent;
      const type = btn?.lastChild?.textContent;
      return {
        id,
        time,
        type
      }
    });
  })
  return buttonIds;
};

export default grabTimes;