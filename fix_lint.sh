#!/bin/bash
sed -i 's/design_config: any/design_config: Record<string, string>/g' src/app/\(dashboard\)/cards/page.tsx
sed -i 's/eslint-disable-next-line react-hooks\/exhaustive-deps//g' src/app/\(dashboard\)/cards/page.tsx
sed -i '/fetchCards()/i \    // eslint-disable-next-line react-hooks/exhaustive-deps' src/app/\(dashboard\)/cards/page.tsx
sed -i "s/Vue d'ensemble/Vue d\&apos;ensemble/g" src/app/\(dashboard\)/page.tsx
sed -i 's/import { Card, CreditCard/import { CreditCard/' src/app/\(dashboard\)/page.tsx
sed -i '/fetchData()/i \    // eslint-disable-next-line react-hooks/exhaustive-deps' src/app/\(dashboard\)/passes/page.tsx
sed -i "s/Veuillez d'abord/Veuillez d\&apos;abord/g" src/app/\(dashboard\)/passes/page.tsx
sed -i '/fetchScans()/i \    // eslint-disable-next-line react-hooks/exhaustive-deps' src/app/\(dashboard\)/scans/page.tsx
sed -i "s/la fin de l'URL/la fin de l\&apos;URL/g" src/app/\(dashboard\)/scans/page.tsx
sed -i 's/catch (error: any)/catch (error: unknown)/g' src/app/api/cards/route.ts
sed -i 's/return NextResponse.json({ error: error.message }/return NextResponse.json({ error: (error as Error).message }/g' src/app/api/cards/route.ts
sed -i 's/catch (error: any)/catch (error: unknown)/g' src/app/api/passes/route.ts
sed -i 's/return NextResponse.json({ error: error.message }/return NextResponse.json({ error: (error as Error).message }/g' src/app/api/passes/route.ts
sed -i 's/catch (error: any)/catch (error: unknown)/g' src/app/api/scans/route.ts
sed -i 's/return NextResponse.json({ error: error.message }/return NextResponse.json({ error: (error as Error).message }/g' src/app/api/scans/route.ts
sed -i 's/useState<any>/useState<PassData | null>/g' src/app/c/\[slug\]/page.tsx
sed -i '/export default function PublicPassPage/i \type PassData = {\n  customer_name: string\n  points: number\n  pass_slug: string\n  cards: { title: string, type: string, design_config?: Record<string, string> }\n  tenants: { name: string }\n}\n' src/app/c/\[slug\]/page.tsx
sed -i '/fetchPass()/i \    // eslint-disable-next-line react-hooks/exhaustive-deps' src/app/c/\[slug\]/page.tsx
sed -i 's/const { data, error } =/const { data } =/g' src/app/c/\[slug\]/page.tsx
sed -i "s/(L'intégration Google/(L\&apos;intégration Google/g" src/app/c/\[slug\]/page.tsx
sed -i "s/S'inscrire/S\&apos;inscrire/g" src/app/page.tsx
sed -i 's/catch (error) {/catch (_error) {/g' src/lib/supabase/server.ts
