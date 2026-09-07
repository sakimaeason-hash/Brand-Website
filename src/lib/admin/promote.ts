type PromotedUser = { id: string; email: string; role: string };

type AdminTransaction = {
  user: {
    updateMany(args: {
      where: { role: "ADMIN"; email: { not: string } };
      data: { role: "USER" };
    }): Promise<{ count: number }>;
    update(args: {
      where: { email: string };
      data: { role: "ADMIN" };
      select: { id: true; email: true; role: true };
    }): Promise<PromotedUser>;
  };
};

type AdminPromotionClient = {
  $transaction<T>(work: (transaction: AdminTransaction) => Promise<T>): Promise<T>;
};

export async function promoteSoleAdmin(client: AdminPromotionClient, rawEmail: string | undefined) {
  const email = rawEmail?.trim().toLowerCase();
  if (!email) throw new Error("ADMIN_EMAIL is required");

  return client.$transaction(async (transaction) => {
    await transaction.user.updateMany({
      where: { role: "ADMIN", email: { not: email } },
      data: { role: "USER" },
    });
    return transaction.user.update({
      where: { email },
      data: { role: "ADMIN" },
      select: { id: true, email: true, role: true },
    });
  });
}
