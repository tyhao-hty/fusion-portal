import crypto from 'crypto'

export const SYSTEM_ACCOUNT = {
  email: 'system@fusion-energy.cn',
  name: 'System Account',
  roles: ['admin'],
}

const randomPassword = () => `${crypto.randomBytes(12).toString('base64url')}A1!`

export const ensureSystemAccount = async (payload) => {
  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: SYSTEM_ACCOUNT.email } },
    limit: 1,
    overrideAccess: true,
  })

  if (existing?.docs?.length) {
    return existing.docs[0].id
  }

  const created = await payload.create({
    collection: 'users',
    data: {
      email: SYSTEM_ACCOUNT.email,
      name: SYSTEM_ACCOUNT.name,
      roles: SYSTEM_ACCOUNT.roles,
      password: randomPassword(),
    },
    overrideAccess: true,
  })

  return created.id
}
