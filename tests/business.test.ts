import {describe,it,expect} from "vitest";import {budgetSummary,guestSummary,planningProgress,bookingTransition} from "../lib/calculations";
describe("wedding planning calculations",()=>{
it("calculates checklist completion and handles no tasks",()=>{expect(planningProgress(["DONE","TODO","DONE"])).toBe(67);expect(planningProgress([])).toBe(0)});
it("sums budget and reports over budget",()=>{expect(budgetSummary(100,[25,30])).toEqual({total:100,spent:55,remaining:45,overBudget:false});expect(budgetSummary(100,[110]).overBudget).toBe(true)});
it("counts each RSVP state",()=>{expect(guestSummary(["CONFIRMED","PENDING","DECLINED","CONFIRMED"])).toEqual({total:4,confirmed:2,pending:1,declined:1})});
it("allows valid booking changes and blocks terminal transitions",()=>{expect(bookingTransition("PENDING","CONFIRMED")).toBe("CONFIRMED");expect(()=>bookingTransition("COMPLETED","CANCELLED")).toThrow()});
});
