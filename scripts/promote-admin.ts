import { prisma } from "../src/lib/db";
import { promoteSoleAdmin } from "../src/lib/admin/promote";

async function main() {
  const user = await promoteSoleAdmin(prisma, process.env.ADMIN_EMAIL);
  console.log(`Promoted ${user.email} to ${user.role} (${user.id})`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
