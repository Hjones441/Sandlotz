import { redirect } from 'next/navigation'

// P2P gear listings have been replaced by the Sponsor Marketplace.
export default function MarketplaceNewPage() {
  redirect('/marketplace')
}
