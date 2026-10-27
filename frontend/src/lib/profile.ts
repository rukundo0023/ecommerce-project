export const profileKey = (userId: string) => `rukundoe-profile-${userId}`;

export const readSavedDeliveryAddress = (
  userId: string
): { address: string; error: string } => {
  if (!userId) return { address: "", error: "" };
  try {
    return {
      address: localStorage.getItem(profileKey(userId)) ?? "",
      error: "",
    };
  } catch {
    return {
      address: "",
      error: "Your browser could not load your saved delivery address.",
    };
  }
};

export const saveDeliveryAddress = (userId: string, address: string) =>
  localStorage.setItem(profileKey(userId), address);
