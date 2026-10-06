import Image from 'next/image';import Link from "next/link";import {MapPin,Star, BadgeCheck} from "lucide-react";import {money} from "@/lib/utils";import {photo} from "@/lib/data";import {FavoriteButton} from "@/components/favorite-button";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function VendorCard({vendor:v, isFavorited=false}: {vendor: any, isFavorited?: boolean}){
  const id = v.id;
  const name = v.name;
  const image = v.imageUrl || v.image; // fallback to mock image
  const imgSrc = image?.includes("http") ? image : photo(image || "photo-1519167758481-83f550bb49b3");
  const categoryName = v.category?.name || v.category || "Vendor";
  const verified = v.verified || v.verification === "VERIFIED";
  const area = v.area;
  const city = v.city;
  const rating = v.rating;
  const reviews = v.reviews ?? v.reviewCount ?? 0;
  const price = v.price ?? v.startingPrice;

  return <article className="group overflow-hidden rounded-2xl border border-[#e9e4de] bg-white transition hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-900/5"><div className="relative block aspect-[1.35] overflow-hidden"><Link href={`/vendors/${id}`}><Image width={1400} height={900} sizes="(max-width: 768px) 100vw, 50vw" src={imgSrc} alt={name} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"/></Link><FavoriteButton id={id} name={name} initialSaved={isFavorited}/><span className="absolute bottom-4 left-4 rounded-full bg-white/95 px-3 py-1.5 text-[11px] tracking-wide">{categoryName}</span></div><div className="p-5"><div className="flex items-start justify-between gap-2"><Link href={`/vendors/${id}`} className="serif text-[21px] leading-tight hover:text-[#a86e64]">{name}</Link>{verified&&<BadgeCheck className="mt-1 shrink-0 text-[#ad806d]" size={17}/>}</div><div className="mt-2 flex items-center gap-1.5 text-xs text-[#817970]"><MapPin size={13}/>{area}, {city}<span className="mx-1">·</span><Star size={13} className="fill-[#ba9973] text-[#ba9973]"/><b className="text-[#302d29]">{rating}</b><span>({reviews})</span></div><div className="mt-5 flex items-center justify-between border-t border-[#eeeae5] pt-4"><span className="text-[11px] text-[#817970]">Starting from</span><span className="font-semibold">{money(Number(price))}</span></div></div></article>;
}

