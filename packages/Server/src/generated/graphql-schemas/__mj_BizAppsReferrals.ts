/********************************************************************************
* ALL ENTITIES - TypeGraphQL Type Class Definition - AUTO GENERATED FILE
* Generated Entities and Resolvers for Server
*
*   >>> DO NOT MODIFY THIS FILE!!!!!!!!!!!!
*   >>> YOUR CHANGES WILL BE OVERWRITTEN
*   >>> THE NEXT TIME THIS FILE IS GENERATED
*
**********************************************************************************/
import { Arg, Ctx, Int, Query, Resolver, Field, Float, ObjectType, InputType, Mutation,
            PubSub, PubSubEngine, ResolverBase, RunViewByIDInput, RunViewByNameInput, RunDynamicViewInput,
            AppContext, KeyValuePairInput, DeleteOptionsInput, GraphQLTimestamp as Timestamp,
            GetReadOnlyProvider, GetReadWriteProvider, RestoreContextInput } from '@memberjunction/server';
import { Metadata, EntityPermissionType, CompositeKey, UserInfo } from '@memberjunction/core'

import { MaxLength } from 'class-validator';
import * as mj_core_schema_server_object_types from '@memberjunction/server'


import { mjBizAppsReferralsConflictCheckPartyEntity, mjBizAppsReferralsJurisdictionEntity, mjBizAppsReferralsPracticeAreaEntity, mjBizAppsReferralsProfessionalJurisdictionEntity, mjBizAppsReferralsProfessionalPracticeAreaEntity, mjBizAppsReferralsProfessionalProfileEntity, mjBizAppsReferralsReferralAssignmentEntity, mjBizAppsReferralsReferralFeedbackEntity, mjBizAppsReferralsReferralRequestEntity, mjBizAppsReferralsReferralTierEntity } from '@mj-biz-apps/referrals-entities';
    

//****************************************************************************
// ENTITY CLASS for MJ_BizApps_Referrals: Conflict Check Parties
//****************************************************************************
@ObjectType({ description: "Parties involved in a referral matter screened for conflicts of interest." })
export class mjBizAppsReferralsConflictCheckParty_ {
    @Field() 
    @MaxLength(36)
    ID: string;
        
    @Field({nullable: true}) 
    @MaxLength(36)
    ReferralRequestID?: string;
        
    @Field({nullable: true}) 
    @MaxLength(255)
    PartyName?: string;
        
    @Field({nullable: true}) 
    @MaxLength(30)
    PartyRole?: string;
        
    @Field({nullable: true}) 
    @MaxLength(255)
    OrganizationName?: string;
        
    @Field({nullable: true}) 
    @MaxLength(255)
    NormalizedName?: string;
        
    @Field({nullable: true}) 
    Notes?: string;
        
    @Field() 
    _mj__CreatedAt: Date;
        
    @Field() 
    _mj__UpdatedAt: Date;
        
    @Field(() => [String], { nullable: true, description: `Field-level security: when non-null, the fields on this entity the calling user may read. Any other field arriving as null was withheld by the server rather than genuinely empty. Null for callers with no field restrictions.` })
    ReadableFields___?: string[];
        
}

//****************************************************************************
// INPUT TYPE for MJ_BizApps_Referrals: Conflict Check Parties
//****************************************************************************
@InputType()
export class CreatemjBizAppsReferralsConflictCheckPartyInput {
    @Field({ nullable: true })
    ID?: string;

    @Field({ nullable: true })
    ReferralRequestID?: string;

    @Field({ nullable: true })
    PartyName?: string;

    @Field({ nullable: true })
    PartyRole?: string;

    @Field({ nullable: true })
    OrganizationName: string | null;

    @Field({ nullable: true })
    NormalizedName?: string;

    @Field({ nullable: true })
    Notes: string | null;

    @Field(() => RestoreContextInput, { nullable: true })
    RestoreContext___?: RestoreContextInput;
}
    

//****************************************************************************
// INPUT TYPE for MJ_BizApps_Referrals: Conflict Check Parties
//****************************************************************************
@InputType()
export class UpdatemjBizAppsReferralsConflictCheckPartyInput {
    @Field()
    ID: string;

    @Field({ nullable: true })
    ReferralRequestID?: string;

    @Field({ nullable: true })
    PartyName?: string;

    @Field({ nullable: true })
    PartyRole?: string;

    @Field({ nullable: true })
    OrganizationName?: string | null;

    @Field({ nullable: true })
    NormalizedName?: string;

    @Field({ nullable: true })
    Notes?: string | null;

    @Field(() => [KeyValuePairInput], { nullable: true })
    OldValues___?: KeyValuePairInput[];

    @Field(() => RestoreContextInput, { nullable: true })
    RestoreContext___?: RestoreContextInput;
}
    
//****************************************************************************
// RESOLVER for MJ_BizApps_Referrals: Conflict Check Parties
//****************************************************************************
@ObjectType()
export class RunmjBizAppsReferralsConflictCheckPartyViewResult {
    @Field(() => [mjBizAppsReferralsConflictCheckParty_])
    Results: mjBizAppsReferralsConflictCheckParty_[];

    @Field(() => String, {nullable: true})
    UserViewRunID?: string;

    @Field(() => Int, {nullable: true})
    RowCount: number;

    @Field(() => Int, {nullable: true})
    TotalRowCount: number;

    @Field(() => Int, {nullable: true})
    ExecutionTime: number;

    @Field({nullable: true})
    ErrorMessage?: string;

    @Field(() => Boolean, {nullable: false})
    Success: boolean;
}

@Resolver(mjBizAppsReferralsConflictCheckParty_)
export class mjBizAppsReferralsConflictCheckPartyResolver extends ResolverBase {
    @Query(() => RunmjBizAppsReferralsConflictCheckPartyViewResult)
    async RunmjBizAppsReferralsConflictCheckPartyViewByID(@Arg('input', () => RunViewByIDInput) input: RunViewByIDInput, @Ctx() { providers, userPayload }: AppContext, @PubSub() pubSub: PubSubEngine) {
        const provider = GetReadOnlyProvider(providers, { allowFallbackToReadWrite: true });
        return super.RunViewByIDGeneric(input, provider, userPayload, pubSub);
    }

    @Query(() => RunmjBizAppsReferralsConflictCheckPartyViewResult)
    async RunmjBizAppsReferralsConflictCheckPartyViewByName(@Arg('input', () => RunViewByNameInput) input: RunViewByNameInput, @Ctx() { providers, userPayload }: AppContext, @PubSub() pubSub: PubSubEngine) {
        const provider = GetReadOnlyProvider(providers, { allowFallbackToReadWrite: true });
        return super.RunViewByNameGeneric(input, provider, userPayload, pubSub);
    }

    @Query(() => RunmjBizAppsReferralsConflictCheckPartyViewResult)
    async RunmjBizAppsReferralsConflictCheckPartyDynamicView(@Arg('input', () => RunDynamicViewInput) input: RunDynamicViewInput, @Ctx() { providers, userPayload }: AppContext, @PubSub() pubSub: PubSubEngine) {
        const provider = GetReadOnlyProvider(providers, { allowFallbackToReadWrite: true });
        input.EntityName = 'MJ_BizApps_Referrals: Conflict Check Parties';
        return super.RunDynamicViewGeneric(input, provider, userPayload, pubSub);
    }
    @Query(() => mjBizAppsReferralsConflictCheckParty_, { nullable: true })
    async mjBizAppsReferralsConflictCheckParty(@Arg('ID', () => String) ID: string, @Ctx() { userPayload, providers }: AppContext, @PubSub() pubSub: PubSubEngine): Promise<mjBizAppsReferralsConflictCheckParty_ | null> {
        this.CheckUserReadPermissions('MJ_BizApps_Referrals: Conflict Check Parties', userPayload);
        const provider = GetReadOnlyProvider(providers, { allowFallbackToReadWrite: true });
        const sSQL = `SELECT * FROM ${provider.QuoteSchemaAndView('__mj_BizAppsReferrals', 'vwConflictCheckParties')} WHERE ${provider.QuoteIdentifier('ID')}=${provider.BuildParameterPlaceholder(0)} ` + this.getRowLevelSecurityWhereClause(provider, 'MJ_BizApps_Referrals: Conflict Check Parties', userPayload, EntityPermissionType.Read, 'AND');
        const rows = await provider.ExecuteSQL(sSQL, [ID], undefined, this.GetUserFromPayload(userPayload));
        const result = await this.MapFieldNamesToCodeNames('MJ_BizApps_Referrals: Conflict Check Parties', rows && rows.length > 0 ? rows[0] : null, this.GetUserFromPayload(userPayload));
        return result;
    }
    
    @Mutation(() => mjBizAppsReferralsConflictCheckParty_)
    async CreatemjBizAppsReferralsConflictCheckParty(
        @Arg('input', () => CreatemjBizAppsReferralsConflictCheckPartyInput) input: CreatemjBizAppsReferralsConflictCheckPartyInput,
        @Ctx() { providers, userPayload }: AppContext,
        @PubSub() pubSub: PubSubEngine
    ) {
        const provider = GetReadWriteProvider(providers);
        return this.CreateRecord('MJ_BizApps_Referrals: Conflict Check Parties', input, provider, userPayload, pubSub)
    }
        
    @Mutation(() => mjBizAppsReferralsConflictCheckParty_)
    async UpdatemjBizAppsReferralsConflictCheckParty(
        @Arg('input', () => UpdatemjBizAppsReferralsConflictCheckPartyInput) input: UpdatemjBizAppsReferralsConflictCheckPartyInput,
        @Ctx() { providers, userPayload }: AppContext,
        @PubSub() pubSub: PubSubEngine
    ) {
        const provider = GetReadWriteProvider(providers);
        return this.UpdateRecord('MJ_BizApps_Referrals: Conflict Check Parties', input, provider, userPayload, pubSub);
    }
    
    @Mutation(() => mjBizAppsReferralsConflictCheckParty_)
    async DeletemjBizAppsReferralsConflictCheckParty(@Arg('ID', () => String) ID: string, @Arg('options___', () => DeleteOptionsInput) options: DeleteOptionsInput, @Ctx() { providers, userPayload }: AppContext, @PubSub() pubSub: PubSubEngine) {
        const provider = GetReadWriteProvider(providers);
        const key = new CompositeKey([{FieldName: 'ID', Value: ID}]);
        return this.DeleteRecord('MJ_BizApps_Referrals: Conflict Check Parties', key, options, provider, userPayload, pubSub);
    }
    
}

//****************************************************************************
// ENTITY CLASS for MJ_BizApps_Referrals: Jurisdictions
//****************************************************************************
@ObjectType({ description: "Hierarchical geographic or regulatory licensing jurisdictions." })
export class mjBizAppsReferralsJurisdiction_ {
    @Field() 
    @MaxLength(36)
    ID: string;
        
    @Field({nullable: true}) 
    @MaxLength(36)
    ParentID?: string;
        
    @Field({nullable: true}) 
    @MaxLength(150)
    Name?: string;
        
    @Field({nullable: true}) 
    @MaxLength(50)
    Code?: string;
        
    @Field({nullable: true}) 
    @MaxLength(30)
    JurisdictionType?: string;
        
    @Field({nullable: true}) 
    @MaxLength(10)
    CountryCode?: string;
        
    @Field({nullable: true}) 
    @MaxLength(20)
    StateProvinceCode?: string;
        
    @Field(() => Boolean, {nullable: true}) 
    IsActive?: boolean;
        
    @Field() 
    _mj__CreatedAt: Date;
        
    @Field() 
    _mj__UpdatedAt: Date;
        
    @Field({nullable: true}) 
    @MaxLength(150)
    Parent?: string;
        
    @Field(() => Float, {nullable: true}) 
    _mj__Latitude?: number;
        
    @Field(() => Float, {nullable: true}) 
    _mj__Longitude?: number;
        
    @Field(() => [String], { nullable: true, description: `Field-level security: when non-null, the fields on this entity the calling user may read. Any other field arriving as null was withheld by the server rather than genuinely empty. Null for callers with no field restrictions.` })
    ReadableFields___?: string[];
        
}

//****************************************************************************
// INPUT TYPE for MJ_BizApps_Referrals: Jurisdictions
//****************************************************************************
@InputType()
export class CreatemjBizAppsReferralsJurisdictionInput {
    @Field({ nullable: true })
    ID?: string;

    @Field({ nullable: true })
    ParentID: string | null;

    @Field({ nullable: true })
    Name?: string;

    @Field({ nullable: true })
    Code?: string;

    @Field({ nullable: true })
    JurisdictionType?: string;

    @Field({ nullable: true })
    CountryCode?: string;

    @Field({ nullable: true })
    StateProvinceCode: string | null;

    @Field(() => Boolean, { nullable: true })
    IsActive?: boolean;

    @Field(() => RestoreContextInput, { nullable: true })
    RestoreContext___?: RestoreContextInput;
}
    

//****************************************************************************
// INPUT TYPE for MJ_BizApps_Referrals: Jurisdictions
//****************************************************************************
@InputType()
export class UpdatemjBizAppsReferralsJurisdictionInput {
    @Field()
    ID: string;

    @Field({ nullable: true })
    ParentID?: string | null;

    @Field({ nullable: true })
    Name?: string;

    @Field({ nullable: true })
    Code?: string;

    @Field({ nullable: true })
    JurisdictionType?: string;

    @Field({ nullable: true })
    CountryCode?: string;

    @Field({ nullable: true })
    StateProvinceCode?: string | null;

    @Field(() => Boolean, { nullable: true })
    IsActive?: boolean;

    @Field(() => [KeyValuePairInput], { nullable: true })
    OldValues___?: KeyValuePairInput[];

    @Field(() => RestoreContextInput, { nullable: true })
    RestoreContext___?: RestoreContextInput;
}
    
//****************************************************************************
// RESOLVER for MJ_BizApps_Referrals: Jurisdictions
//****************************************************************************
@ObjectType()
export class RunmjBizAppsReferralsJurisdictionViewResult {
    @Field(() => [mjBizAppsReferralsJurisdiction_])
    Results: mjBizAppsReferralsJurisdiction_[];

    @Field(() => String, {nullable: true})
    UserViewRunID?: string;

    @Field(() => Int, {nullable: true})
    RowCount: number;

    @Field(() => Int, {nullable: true})
    TotalRowCount: number;

    @Field(() => Int, {nullable: true})
    ExecutionTime: number;

    @Field({nullable: true})
    ErrorMessage?: string;

    @Field(() => Boolean, {nullable: false})
    Success: boolean;
}

@Resolver(mjBizAppsReferralsJurisdiction_)
export class mjBizAppsReferralsJurisdictionResolver extends ResolverBase {
    @Query(() => RunmjBizAppsReferralsJurisdictionViewResult)
    async RunmjBizAppsReferralsJurisdictionViewByID(@Arg('input', () => RunViewByIDInput) input: RunViewByIDInput, @Ctx() { providers, userPayload }: AppContext, @PubSub() pubSub: PubSubEngine) {
        const provider = GetReadOnlyProvider(providers, { allowFallbackToReadWrite: true });
        return super.RunViewByIDGeneric(input, provider, userPayload, pubSub);
    }

    @Query(() => RunmjBizAppsReferralsJurisdictionViewResult)
    async RunmjBizAppsReferralsJurisdictionViewByName(@Arg('input', () => RunViewByNameInput) input: RunViewByNameInput, @Ctx() { providers, userPayload }: AppContext, @PubSub() pubSub: PubSubEngine) {
        const provider = GetReadOnlyProvider(providers, { allowFallbackToReadWrite: true });
        return super.RunViewByNameGeneric(input, provider, userPayload, pubSub);
    }

    @Query(() => RunmjBizAppsReferralsJurisdictionViewResult)
    async RunmjBizAppsReferralsJurisdictionDynamicView(@Arg('input', () => RunDynamicViewInput) input: RunDynamicViewInput, @Ctx() { providers, userPayload }: AppContext, @PubSub() pubSub: PubSubEngine) {
        const provider = GetReadOnlyProvider(providers, { allowFallbackToReadWrite: true });
        input.EntityName = 'MJ_BizApps_Referrals: Jurisdictions';
        return super.RunDynamicViewGeneric(input, provider, userPayload, pubSub);
    }
    @Query(() => mjBizAppsReferralsJurisdiction_, { nullable: true })
    async mjBizAppsReferralsJurisdiction(@Arg('ID', () => String) ID: string, @Ctx() { userPayload, providers }: AppContext, @PubSub() pubSub: PubSubEngine): Promise<mjBizAppsReferralsJurisdiction_ | null> {
        this.CheckUserReadPermissions('MJ_BizApps_Referrals: Jurisdictions', userPayload);
        const provider = GetReadOnlyProvider(providers, { allowFallbackToReadWrite: true });
        const sSQL = `SELECT * FROM ${provider.QuoteSchemaAndView('__mj_BizAppsReferrals', 'vwJurisdictions')} WHERE ${provider.QuoteIdentifier('ID')}=${provider.BuildParameterPlaceholder(0)} ` + this.getRowLevelSecurityWhereClause(provider, 'MJ_BizApps_Referrals: Jurisdictions', userPayload, EntityPermissionType.Read, 'AND');
        const rows = await provider.ExecuteSQL(sSQL, [ID], undefined, this.GetUserFromPayload(userPayload));
        const result = await this.MapFieldNamesToCodeNames('MJ_BizApps_Referrals: Jurisdictions', rows && rows.length > 0 ? rows[0] : null, this.GetUserFromPayload(userPayload));
        return result;
    }
    
    @Mutation(() => mjBizAppsReferralsJurisdiction_)
    async CreatemjBizAppsReferralsJurisdiction(
        @Arg('input', () => CreatemjBizAppsReferralsJurisdictionInput) input: CreatemjBizAppsReferralsJurisdictionInput,
        @Ctx() { providers, userPayload }: AppContext,
        @PubSub() pubSub: PubSubEngine
    ) {
        const provider = GetReadWriteProvider(providers);
        return this.CreateRecord('MJ_BizApps_Referrals: Jurisdictions', input, provider, userPayload, pubSub)
    }
        
    @Mutation(() => mjBizAppsReferralsJurisdiction_)
    async UpdatemjBizAppsReferralsJurisdiction(
        @Arg('input', () => UpdatemjBizAppsReferralsJurisdictionInput) input: UpdatemjBizAppsReferralsJurisdictionInput,
        @Ctx() { providers, userPayload }: AppContext,
        @PubSub() pubSub: PubSubEngine
    ) {
        const provider = GetReadWriteProvider(providers);
        return this.UpdateRecord('MJ_BizApps_Referrals: Jurisdictions', input, provider, userPayload, pubSub);
    }
    
    @Mutation(() => mjBizAppsReferralsJurisdiction_)
    async DeletemjBizAppsReferralsJurisdiction(@Arg('ID', () => String) ID: string, @Arg('options___', () => DeleteOptionsInput) options: DeleteOptionsInput, @Ctx() { providers, userPayload }: AppContext, @PubSub() pubSub: PubSubEngine) {
        const provider = GetReadWriteProvider(providers);
        const key = new CompositeKey([{FieldName: 'ID', Value: ID}]);
        return this.DeleteRecord('MJ_BizApps_Referrals: Jurisdictions', key, options, provider, userPayload, pubSub);
    }
    
}

//****************************************************************************
// ENTITY CLASS for MJ_BizApps_Referrals: Practice Areas
//****************************************************************************
@ObjectType({ description: "Hierarchical taxonomy of legal, accounting, or advisory practice areas." })
export class mjBizAppsReferralsPracticeArea_ {
    @Field() 
    @MaxLength(36)
    ID: string;
        
    @Field({nullable: true}) 
    @MaxLength(36)
    ParentID?: string;
        
    @Field({nullable: true}) 
    @MaxLength(150)
    Name?: string;
        
    @Field({nullable: true}) 
    @MaxLength(50)
    Code?: string;
        
    @Field({nullable: true}) 
    @MaxLength(100)
    Category?: string;
        
    @Field({nullable: true}) 
    Description?: string;
        
    @Field({nullable: true}) 
    @MaxLength(100)
    IconClass?: string;
        
    @Field(() => Int, {nullable: true}) 
    DisplayRank?: number;
        
    @Field(() => Boolean, {nullable: true}) 
    IsActive?: boolean;
        
    @Field() 
    _mj__CreatedAt: Date;
        
    @Field() 
    _mj__UpdatedAt: Date;
        
    @Field({nullable: true}) 
    @MaxLength(150)
    Parent?: string;
        
    @Field(() => [String], { nullable: true, description: `Field-level security: when non-null, the fields on this entity the calling user may read. Any other field arriving as null was withheld by the server rather than genuinely empty. Null for callers with no field restrictions.` })
    ReadableFields___?: string[];
        
}

//****************************************************************************
// INPUT TYPE for MJ_BizApps_Referrals: Practice Areas
//****************************************************************************
@InputType()
export class CreatemjBizAppsReferralsPracticeAreaInput {
    @Field({ nullable: true })
    ID?: string;

    @Field({ nullable: true })
    ParentID: string | null;

    @Field({ nullable: true })
    Name?: string;

    @Field({ nullable: true })
    Code?: string;

    @Field({ nullable: true })
    Category: string | null;

    @Field({ nullable: true })
    Description: string | null;

    @Field({ nullable: true })
    IconClass: string | null;

    @Field(() => Int, { nullable: true })
    DisplayRank?: number;

    @Field(() => Boolean, { nullable: true })
    IsActive?: boolean;

    @Field(() => RestoreContextInput, { nullable: true })
    RestoreContext___?: RestoreContextInput;
}
    

//****************************************************************************
// INPUT TYPE for MJ_BizApps_Referrals: Practice Areas
//****************************************************************************
@InputType()
export class UpdatemjBizAppsReferralsPracticeAreaInput {
    @Field()
    ID: string;

    @Field({ nullable: true })
    ParentID?: string | null;

    @Field({ nullable: true })
    Name?: string;

    @Field({ nullable: true })
    Code?: string;

    @Field({ nullable: true })
    Category?: string | null;

    @Field({ nullable: true })
    Description?: string | null;

    @Field({ nullable: true })
    IconClass?: string | null;

    @Field(() => Int, { nullable: true })
    DisplayRank?: number;

    @Field(() => Boolean, { nullable: true })
    IsActive?: boolean;

    @Field(() => [KeyValuePairInput], { nullable: true })
    OldValues___?: KeyValuePairInput[];

    @Field(() => RestoreContextInput, { nullable: true })
    RestoreContext___?: RestoreContextInput;
}
    
//****************************************************************************
// RESOLVER for MJ_BizApps_Referrals: Practice Areas
//****************************************************************************
@ObjectType()
export class RunmjBizAppsReferralsPracticeAreaViewResult {
    @Field(() => [mjBizAppsReferralsPracticeArea_])
    Results: mjBizAppsReferralsPracticeArea_[];

    @Field(() => String, {nullable: true})
    UserViewRunID?: string;

    @Field(() => Int, {nullable: true})
    RowCount: number;

    @Field(() => Int, {nullable: true})
    TotalRowCount: number;

    @Field(() => Int, {nullable: true})
    ExecutionTime: number;

    @Field({nullable: true})
    ErrorMessage?: string;

    @Field(() => Boolean, {nullable: false})
    Success: boolean;
}

@Resolver(mjBizAppsReferralsPracticeArea_)
export class mjBizAppsReferralsPracticeAreaResolver extends ResolverBase {
    @Query(() => RunmjBizAppsReferralsPracticeAreaViewResult)
    async RunmjBizAppsReferralsPracticeAreaViewByID(@Arg('input', () => RunViewByIDInput) input: RunViewByIDInput, @Ctx() { providers, userPayload }: AppContext, @PubSub() pubSub: PubSubEngine) {
        const provider = GetReadOnlyProvider(providers, { allowFallbackToReadWrite: true });
        return super.RunViewByIDGeneric(input, provider, userPayload, pubSub);
    }

    @Query(() => RunmjBizAppsReferralsPracticeAreaViewResult)
    async RunmjBizAppsReferralsPracticeAreaViewByName(@Arg('input', () => RunViewByNameInput) input: RunViewByNameInput, @Ctx() { providers, userPayload }: AppContext, @PubSub() pubSub: PubSubEngine) {
        const provider = GetReadOnlyProvider(providers, { allowFallbackToReadWrite: true });
        return super.RunViewByNameGeneric(input, provider, userPayload, pubSub);
    }

    @Query(() => RunmjBizAppsReferralsPracticeAreaViewResult)
    async RunmjBizAppsReferralsPracticeAreaDynamicView(@Arg('input', () => RunDynamicViewInput) input: RunDynamicViewInput, @Ctx() { providers, userPayload }: AppContext, @PubSub() pubSub: PubSubEngine) {
        const provider = GetReadOnlyProvider(providers, { allowFallbackToReadWrite: true });
        input.EntityName = 'MJ_BizApps_Referrals: Practice Areas';
        return super.RunDynamicViewGeneric(input, provider, userPayload, pubSub);
    }
    @Query(() => mjBizAppsReferralsPracticeArea_, { nullable: true })
    async mjBizAppsReferralsPracticeArea(@Arg('ID', () => String) ID: string, @Ctx() { userPayload, providers }: AppContext, @PubSub() pubSub: PubSubEngine): Promise<mjBizAppsReferralsPracticeArea_ | null> {
        this.CheckUserReadPermissions('MJ_BizApps_Referrals: Practice Areas', userPayload);
        const provider = GetReadOnlyProvider(providers, { allowFallbackToReadWrite: true });
        const sSQL = `SELECT * FROM ${provider.QuoteSchemaAndView('__mj_BizAppsReferrals', 'vwPracticeAreas')} WHERE ${provider.QuoteIdentifier('ID')}=${provider.BuildParameterPlaceholder(0)} ` + this.getRowLevelSecurityWhereClause(provider, 'MJ_BizApps_Referrals: Practice Areas', userPayload, EntityPermissionType.Read, 'AND');
        const rows = await provider.ExecuteSQL(sSQL, [ID], undefined, this.GetUserFromPayload(userPayload));
        const result = await this.MapFieldNamesToCodeNames('MJ_BizApps_Referrals: Practice Areas', rows && rows.length > 0 ? rows[0] : null, this.GetUserFromPayload(userPayload));
        return result;
    }
    
    @Mutation(() => mjBizAppsReferralsPracticeArea_)
    async CreatemjBizAppsReferralsPracticeArea(
        @Arg('input', () => CreatemjBizAppsReferralsPracticeAreaInput) input: CreatemjBizAppsReferralsPracticeAreaInput,
        @Ctx() { providers, userPayload }: AppContext,
        @PubSub() pubSub: PubSubEngine
    ) {
        const provider = GetReadWriteProvider(providers);
        return this.CreateRecord('MJ_BizApps_Referrals: Practice Areas', input, provider, userPayload, pubSub)
    }
        
    @Mutation(() => mjBizAppsReferralsPracticeArea_)
    async UpdatemjBizAppsReferralsPracticeArea(
        @Arg('input', () => UpdatemjBizAppsReferralsPracticeAreaInput) input: UpdatemjBizAppsReferralsPracticeAreaInput,
        @Ctx() { providers, userPayload }: AppContext,
        @PubSub() pubSub: PubSubEngine
    ) {
        const provider = GetReadWriteProvider(providers);
        return this.UpdateRecord('MJ_BizApps_Referrals: Practice Areas', input, provider, userPayload, pubSub);
    }
    
    @Mutation(() => mjBizAppsReferralsPracticeArea_)
    async DeletemjBizAppsReferralsPracticeArea(@Arg('ID', () => String) ID: string, @Arg('options___', () => DeleteOptionsInput) options: DeleteOptionsInput, @Ctx() { providers, userPayload }: AppContext, @PubSub() pubSub: PubSubEngine) {
        const provider = GetReadWriteProvider(providers);
        const key = new CompositeKey([{FieldName: 'ID', Value: ID}]);
        return this.DeleteRecord('MJ_BizApps_Referrals: Practice Areas', key, options, provider, userPayload, pubSub);
    }
    
}

//****************************************************************************
// ENTITY CLASS for MJ_BizApps_Referrals: Professional Jurisdictions
//****************************************************************************
@ObjectType({ description: "Junction linking professionals to admitted jurisdictions and license standing." })
export class mjBizAppsReferralsProfessionalJurisdiction_ {
    @Field() 
    @MaxLength(36)
    ID: string;
        
    @Field({nullable: true}) 
    @MaxLength(36)
    ProfessionalProfileID?: string;
        
    @Field({nullable: true}) 
    @MaxLength(36)
    JurisdictionID?: string;
        
    @Field({nullable: true}) 
    @MaxLength(100)
    LicenseNumber?: string;
        
    @Field(() => Int, {nullable: true}) 
    AdmissionYear?: number;
        
    @Field({nullable: true}) 
    @MaxLength(30)
    StandingStatus?: string;
        
    @Field(() => Boolean, {nullable: true}) 
    IsPrimary?: boolean;
        
    @Field() 
    _mj__CreatedAt: Date;
        
    @Field() 
    _mj__UpdatedAt: Date;
        
    @Field({nullable: true}) 
    @MaxLength(150)
    Jurisdiction?: string;
        
    @Field(() => [String], { nullable: true, description: `Field-level security: when non-null, the fields on this entity the calling user may read. Any other field arriving as null was withheld by the server rather than genuinely empty. Null for callers with no field restrictions.` })
    ReadableFields___?: string[];
        
}

//****************************************************************************
// INPUT TYPE for MJ_BizApps_Referrals: Professional Jurisdictions
//****************************************************************************
@InputType()
export class CreatemjBizAppsReferralsProfessionalJurisdictionInput {
    @Field({ nullable: true })
    ID?: string;

    @Field({ nullable: true })
    ProfessionalProfileID?: string;

    @Field({ nullable: true })
    JurisdictionID?: string;

    @Field({ nullable: true })
    LicenseNumber: string | null;

    @Field(() => Int, { nullable: true })
    AdmissionYear: number | null;

    @Field({ nullable: true })
    StandingStatus?: string;

    @Field(() => Boolean, { nullable: true })
    IsPrimary?: boolean;

    @Field(() => RestoreContextInput, { nullable: true })
    RestoreContext___?: RestoreContextInput;
}
    

//****************************************************************************
// INPUT TYPE for MJ_BizApps_Referrals: Professional Jurisdictions
//****************************************************************************
@InputType()
export class UpdatemjBizAppsReferralsProfessionalJurisdictionInput {
    @Field()
    ID: string;

    @Field({ nullable: true })
    ProfessionalProfileID?: string;

    @Field({ nullable: true })
    JurisdictionID?: string;

    @Field({ nullable: true })
    LicenseNumber?: string | null;

    @Field(() => Int, { nullable: true })
    AdmissionYear?: number | null;

    @Field({ nullable: true })
    StandingStatus?: string;

    @Field(() => Boolean, { nullable: true })
    IsPrimary?: boolean;

    @Field(() => [KeyValuePairInput], { nullable: true })
    OldValues___?: KeyValuePairInput[];

    @Field(() => RestoreContextInput, { nullable: true })
    RestoreContext___?: RestoreContextInput;
}
    
//****************************************************************************
// RESOLVER for MJ_BizApps_Referrals: Professional Jurisdictions
//****************************************************************************
@ObjectType()
export class RunmjBizAppsReferralsProfessionalJurisdictionViewResult {
    @Field(() => [mjBizAppsReferralsProfessionalJurisdiction_])
    Results: mjBizAppsReferralsProfessionalJurisdiction_[];

    @Field(() => String, {nullable: true})
    UserViewRunID?: string;

    @Field(() => Int, {nullable: true})
    RowCount: number;

    @Field(() => Int, {nullable: true})
    TotalRowCount: number;

    @Field(() => Int, {nullable: true})
    ExecutionTime: number;

    @Field({nullable: true})
    ErrorMessage?: string;

    @Field(() => Boolean, {nullable: false})
    Success: boolean;
}

@Resolver(mjBizAppsReferralsProfessionalJurisdiction_)
export class mjBizAppsReferralsProfessionalJurisdictionResolver extends ResolverBase {
    @Query(() => RunmjBizAppsReferralsProfessionalJurisdictionViewResult)
    async RunmjBizAppsReferralsProfessionalJurisdictionViewByID(@Arg('input', () => RunViewByIDInput) input: RunViewByIDInput, @Ctx() { providers, userPayload }: AppContext, @PubSub() pubSub: PubSubEngine) {
        const provider = GetReadOnlyProvider(providers, { allowFallbackToReadWrite: true });
        return super.RunViewByIDGeneric(input, provider, userPayload, pubSub);
    }

    @Query(() => RunmjBizAppsReferralsProfessionalJurisdictionViewResult)
    async RunmjBizAppsReferralsProfessionalJurisdictionViewByName(@Arg('input', () => RunViewByNameInput) input: RunViewByNameInput, @Ctx() { providers, userPayload }: AppContext, @PubSub() pubSub: PubSubEngine) {
        const provider = GetReadOnlyProvider(providers, { allowFallbackToReadWrite: true });
        return super.RunViewByNameGeneric(input, provider, userPayload, pubSub);
    }

    @Query(() => RunmjBizAppsReferralsProfessionalJurisdictionViewResult)
    async RunmjBizAppsReferralsProfessionalJurisdictionDynamicView(@Arg('input', () => RunDynamicViewInput) input: RunDynamicViewInput, @Ctx() { providers, userPayload }: AppContext, @PubSub() pubSub: PubSubEngine) {
        const provider = GetReadOnlyProvider(providers, { allowFallbackToReadWrite: true });
        input.EntityName = 'MJ_BizApps_Referrals: Professional Jurisdictions';
        return super.RunDynamicViewGeneric(input, provider, userPayload, pubSub);
    }
    @Query(() => mjBizAppsReferralsProfessionalJurisdiction_, { nullable: true })
    async mjBizAppsReferralsProfessionalJurisdiction(@Arg('ID', () => String) ID: string, @Ctx() { userPayload, providers }: AppContext, @PubSub() pubSub: PubSubEngine): Promise<mjBizAppsReferralsProfessionalJurisdiction_ | null> {
        this.CheckUserReadPermissions('MJ_BizApps_Referrals: Professional Jurisdictions', userPayload);
        const provider = GetReadOnlyProvider(providers, { allowFallbackToReadWrite: true });
        const sSQL = `SELECT * FROM ${provider.QuoteSchemaAndView('__mj_BizAppsReferrals', 'vwProfessionalJurisdictions')} WHERE ${provider.QuoteIdentifier('ID')}=${provider.BuildParameterPlaceholder(0)} ` + this.getRowLevelSecurityWhereClause(provider, 'MJ_BizApps_Referrals: Professional Jurisdictions', userPayload, EntityPermissionType.Read, 'AND');
        const rows = await provider.ExecuteSQL(sSQL, [ID], undefined, this.GetUserFromPayload(userPayload));
        const result = await this.MapFieldNamesToCodeNames('MJ_BizApps_Referrals: Professional Jurisdictions', rows && rows.length > 0 ? rows[0] : null, this.GetUserFromPayload(userPayload));
        return result;
    }
    
    @Mutation(() => mjBizAppsReferralsProfessionalJurisdiction_)
    async CreatemjBizAppsReferralsProfessionalJurisdiction(
        @Arg('input', () => CreatemjBizAppsReferralsProfessionalJurisdictionInput) input: CreatemjBizAppsReferralsProfessionalJurisdictionInput,
        @Ctx() { providers, userPayload }: AppContext,
        @PubSub() pubSub: PubSubEngine
    ) {
        const provider = GetReadWriteProvider(providers);
        return this.CreateRecord('MJ_BizApps_Referrals: Professional Jurisdictions', input, provider, userPayload, pubSub)
    }
        
    @Mutation(() => mjBizAppsReferralsProfessionalJurisdiction_)
    async UpdatemjBizAppsReferralsProfessionalJurisdiction(
        @Arg('input', () => UpdatemjBizAppsReferralsProfessionalJurisdictionInput) input: UpdatemjBizAppsReferralsProfessionalJurisdictionInput,
        @Ctx() { providers, userPayload }: AppContext,
        @PubSub() pubSub: PubSubEngine
    ) {
        const provider = GetReadWriteProvider(providers);
        return this.UpdateRecord('MJ_BizApps_Referrals: Professional Jurisdictions', input, provider, userPayload, pubSub);
    }
    
    @Mutation(() => mjBizAppsReferralsProfessionalJurisdiction_)
    async DeletemjBizAppsReferralsProfessionalJurisdiction(@Arg('ID', () => String) ID: string, @Arg('options___', () => DeleteOptionsInput) options: DeleteOptionsInput, @Ctx() { providers, userPayload }: AppContext, @PubSub() pubSub: PubSubEngine) {
        const provider = GetReadWriteProvider(providers);
        const key = new CompositeKey([{FieldName: 'ID', Value: ID}]);
        return this.DeleteRecord('MJ_BizApps_Referrals: Professional Jurisdictions', key, options, provider, userPayload, pubSub);
    }
    
}

//****************************************************************************
// ENTITY CLASS for MJ_BizApps_Referrals: Professional Practice Areas
//****************************************************************************
@ObjectType({ description: "Junction linking professionals to practice areas with proficiency metadata." })
export class mjBizAppsReferralsProfessionalPracticeArea_ {
    @Field() 
    @MaxLength(36)
    ID: string;
        
    @Field({nullable: true}) 
    @MaxLength(36)
    ProfessionalProfileID?: string;
        
    @Field({nullable: true}) 
    @MaxLength(36)
    PracticeAreaID?: string;
        
    @Field({nullable: true}) 
    @MaxLength(30)
    ProficiencyLevel?: string;
        
    @Field(() => Int, {nullable: true}) 
    YearsInPractice?: number;
        
    @Field(() => Boolean, {nullable: true}) 
    IsPrimary?: boolean;
        
    @Field() 
    _mj__CreatedAt: Date;
        
    @Field() 
    _mj__UpdatedAt: Date;
        
    @Field({nullable: true}) 
    @MaxLength(150)
    PracticeArea?: string;
        
    @Field(() => [String], { nullable: true, description: `Field-level security: when non-null, the fields on this entity the calling user may read. Any other field arriving as null was withheld by the server rather than genuinely empty. Null for callers with no field restrictions.` })
    ReadableFields___?: string[];
        
}

//****************************************************************************
// INPUT TYPE for MJ_BizApps_Referrals: Professional Practice Areas
//****************************************************************************
@InputType()
export class CreatemjBizAppsReferralsProfessionalPracticeAreaInput {
    @Field({ nullable: true })
    ID?: string;

    @Field({ nullable: true })
    ProfessionalProfileID?: string;

    @Field({ nullable: true })
    PracticeAreaID?: string;

    @Field({ nullable: true })
    ProficiencyLevel?: string;

    @Field(() => Int, { nullable: true })
    YearsInPractice?: number;

    @Field(() => Boolean, { nullable: true })
    IsPrimary?: boolean;

    @Field(() => RestoreContextInput, { nullable: true })
    RestoreContext___?: RestoreContextInput;
}
    

//****************************************************************************
// INPUT TYPE for MJ_BizApps_Referrals: Professional Practice Areas
//****************************************************************************
@InputType()
export class UpdatemjBizAppsReferralsProfessionalPracticeAreaInput {
    @Field()
    ID: string;

    @Field({ nullable: true })
    ProfessionalProfileID?: string;

    @Field({ nullable: true })
    PracticeAreaID?: string;

    @Field({ nullable: true })
    ProficiencyLevel?: string;

    @Field(() => Int, { nullable: true })
    YearsInPractice?: number;

    @Field(() => Boolean, { nullable: true })
    IsPrimary?: boolean;

    @Field(() => [KeyValuePairInput], { nullable: true })
    OldValues___?: KeyValuePairInput[];

    @Field(() => RestoreContextInput, { nullable: true })
    RestoreContext___?: RestoreContextInput;
}
    
//****************************************************************************
// RESOLVER for MJ_BizApps_Referrals: Professional Practice Areas
//****************************************************************************
@ObjectType()
export class RunmjBizAppsReferralsProfessionalPracticeAreaViewResult {
    @Field(() => [mjBizAppsReferralsProfessionalPracticeArea_])
    Results: mjBizAppsReferralsProfessionalPracticeArea_[];

    @Field(() => String, {nullable: true})
    UserViewRunID?: string;

    @Field(() => Int, {nullable: true})
    RowCount: number;

    @Field(() => Int, {nullable: true})
    TotalRowCount: number;

    @Field(() => Int, {nullable: true})
    ExecutionTime: number;

    @Field({nullable: true})
    ErrorMessage?: string;

    @Field(() => Boolean, {nullable: false})
    Success: boolean;
}

@Resolver(mjBizAppsReferralsProfessionalPracticeArea_)
export class mjBizAppsReferralsProfessionalPracticeAreaResolver extends ResolverBase {
    @Query(() => RunmjBizAppsReferralsProfessionalPracticeAreaViewResult)
    async RunmjBizAppsReferralsProfessionalPracticeAreaViewByID(@Arg('input', () => RunViewByIDInput) input: RunViewByIDInput, @Ctx() { providers, userPayload }: AppContext, @PubSub() pubSub: PubSubEngine) {
        const provider = GetReadOnlyProvider(providers, { allowFallbackToReadWrite: true });
        return super.RunViewByIDGeneric(input, provider, userPayload, pubSub);
    }

    @Query(() => RunmjBizAppsReferralsProfessionalPracticeAreaViewResult)
    async RunmjBizAppsReferralsProfessionalPracticeAreaViewByName(@Arg('input', () => RunViewByNameInput) input: RunViewByNameInput, @Ctx() { providers, userPayload }: AppContext, @PubSub() pubSub: PubSubEngine) {
        const provider = GetReadOnlyProvider(providers, { allowFallbackToReadWrite: true });
        return super.RunViewByNameGeneric(input, provider, userPayload, pubSub);
    }

    @Query(() => RunmjBizAppsReferralsProfessionalPracticeAreaViewResult)
    async RunmjBizAppsReferralsProfessionalPracticeAreaDynamicView(@Arg('input', () => RunDynamicViewInput) input: RunDynamicViewInput, @Ctx() { providers, userPayload }: AppContext, @PubSub() pubSub: PubSubEngine) {
        const provider = GetReadOnlyProvider(providers, { allowFallbackToReadWrite: true });
        input.EntityName = 'MJ_BizApps_Referrals: Professional Practice Areas';
        return super.RunDynamicViewGeneric(input, provider, userPayload, pubSub);
    }
    @Query(() => mjBizAppsReferralsProfessionalPracticeArea_, { nullable: true })
    async mjBizAppsReferralsProfessionalPracticeArea(@Arg('ID', () => String) ID: string, @Ctx() { userPayload, providers }: AppContext, @PubSub() pubSub: PubSubEngine): Promise<mjBizAppsReferralsProfessionalPracticeArea_ | null> {
        this.CheckUserReadPermissions('MJ_BizApps_Referrals: Professional Practice Areas', userPayload);
        const provider = GetReadOnlyProvider(providers, { allowFallbackToReadWrite: true });
        const sSQL = `SELECT * FROM ${provider.QuoteSchemaAndView('__mj_BizAppsReferrals', 'vwProfessionalPracticeAreas')} WHERE ${provider.QuoteIdentifier('ID')}=${provider.BuildParameterPlaceholder(0)} ` + this.getRowLevelSecurityWhereClause(provider, 'MJ_BizApps_Referrals: Professional Practice Areas', userPayload, EntityPermissionType.Read, 'AND');
        const rows = await provider.ExecuteSQL(sSQL, [ID], undefined, this.GetUserFromPayload(userPayload));
        const result = await this.MapFieldNamesToCodeNames('MJ_BizApps_Referrals: Professional Practice Areas', rows && rows.length > 0 ? rows[0] : null, this.GetUserFromPayload(userPayload));
        return result;
    }
    
    @Mutation(() => mjBizAppsReferralsProfessionalPracticeArea_)
    async CreatemjBizAppsReferralsProfessionalPracticeArea(
        @Arg('input', () => CreatemjBizAppsReferralsProfessionalPracticeAreaInput) input: CreatemjBizAppsReferralsProfessionalPracticeAreaInput,
        @Ctx() { providers, userPayload }: AppContext,
        @PubSub() pubSub: PubSubEngine
    ) {
        const provider = GetReadWriteProvider(providers);
        return this.CreateRecord('MJ_BizApps_Referrals: Professional Practice Areas', input, provider, userPayload, pubSub)
    }
        
    @Mutation(() => mjBizAppsReferralsProfessionalPracticeArea_)
    async UpdatemjBizAppsReferralsProfessionalPracticeArea(
        @Arg('input', () => UpdatemjBizAppsReferralsProfessionalPracticeAreaInput) input: UpdatemjBizAppsReferralsProfessionalPracticeAreaInput,
        @Ctx() { providers, userPayload }: AppContext,
        @PubSub() pubSub: PubSubEngine
    ) {
        const provider = GetReadWriteProvider(providers);
        return this.UpdateRecord('MJ_BizApps_Referrals: Professional Practice Areas', input, provider, userPayload, pubSub);
    }
    
    @Mutation(() => mjBizAppsReferralsProfessionalPracticeArea_)
    async DeletemjBizAppsReferralsProfessionalPracticeArea(@Arg('ID', () => String) ID: string, @Arg('options___', () => DeleteOptionsInput) options: DeleteOptionsInput, @Ctx() { providers, userPayload }: AppContext, @PubSub() pubSub: PubSubEngine) {
        const provider = GetReadWriteProvider(providers);
        const key = new CompositeKey([{FieldName: 'ID', Value: ID}]);
        return this.DeleteRecord('MJ_BizApps_Referrals: Professional Practice Areas', key, options, provider, userPayload, pubSub);
    }
    
}

//****************************************************************************
// ENTITY CLASS for MJ_BizApps_Referrals: Professional Profiles
//****************************************************************************
@ObjectType({ description: "Verified member directory profile for credentialed professionals." })
export class mjBizAppsReferralsProfessionalProfile_ {
    @Field() 
    @MaxLength(36)
    ID: string;
        
    @Field({nullable: true}) 
    @MaxLength(36)
    PersonID?: string;
        
    @Field({nullable: true}) 
    @MaxLength(36)
    OrganizationID?: string;
        
    @Field({nullable: true}) 
    @MaxLength(36)
    UserID?: string;
        
    @Field({nullable: true}) 
    @MaxLength(200)
    DisplayName?: string;
        
    @Field({nullable: true}) 
    @MaxLength(200)
    FirmName?: string;
        
    @Field({nullable: true}) 
    @MaxLength(255)
    Email?: string;
        
    @Field({nullable: true}) 
    @MaxLength(50)
    Phone?: string;
        
    @Field({nullable: true}) 
    @MaxLength(100)
    BarOrLicenseNumber?: string;
        
    @Field({nullable: true}) 
    @MaxLength(30)
    VerificationStatus?: string;
        
    @Field({nullable: true}) 
    @MaxLength(30)
    AvailabilityStatus?: string;
        
    @Field({nullable: true}) 
    Bio?: string;
        
    @Field(() => Int, {nullable: true}) 
    YearsExperience?: number;
        
    @Field({nullable: true}) 
    @MaxLength(255)
    Languages?: string;
        
    @Field(() => Float, {nullable: true}) 
    HourlyRateMin?: number;
        
    @Field(() => Float, {nullable: true}) 
    HourlyRateMax?: number;
        
    @Field(() => Boolean, {nullable: true}) 
    AcceptsProBono?: boolean;
        
    @Field(() => Boolean, {nullable: true}) 
    AcceptsContingency?: boolean;
        
    @Field(() => Int, {nullable: true}) 
    ActiveReferralCount?: number;
        
    @Field(() => Int, {nullable: true}) 
    MaxConcurrentReferrals?: number;
        
    @Field(() => Float, {nullable: true}) 
    AverageResponseHours?: number;
        
    @Field(() => Float, {nullable: true}) 
    AverageRating?: number;
        
    @Field(() => Int, {nullable: true}) 
    TotalAcceptedCount?: number;
        
    @Field(() => Int, {nullable: true}) 
    TotalCompletedCount?: number;
        
    @Field(() => Boolean, {nullable: true}) 
    IsActive?: boolean;
        
    @Field() 
    _mj__CreatedAt: Date;
        
    @Field() 
    _mj__UpdatedAt: Date;
        
    @Field({nullable: true}) 
    @MaxLength(250)
    Person?: string;
        
    @Field({nullable: true}) 
    @MaxLength(255)
    Organization?: string;
        
    @Field({nullable: true}) 
    @MaxLength(100)
    User?: string;
        
    @Field(() => [String], { nullable: true, description: `Field-level security: when non-null, the fields on this entity the calling user may read. Any other field arriving as null was withheld by the server rather than genuinely empty. Null for callers with no field restrictions.` })
    ReadableFields___?: string[];
        
}

//****************************************************************************
// INPUT TYPE for MJ_BizApps_Referrals: Professional Profiles
//****************************************************************************
@InputType()
export class CreatemjBizAppsReferralsProfessionalProfileInput {
    @Field({ nullable: true })
    ID?: string;

    @Field({ nullable: true })
    PersonID: string | null;

    @Field({ nullable: true })
    OrganizationID: string | null;

    @Field({ nullable: true })
    UserID: string | null;

    @Field({ nullable: true })
    DisplayName?: string;

    @Field({ nullable: true })
    FirmName: string | null;

    @Field({ nullable: true })
    Email?: string;

    @Field({ nullable: true })
    Phone: string | null;

    @Field({ nullable: true })
    BarOrLicenseNumber: string | null;

    @Field({ nullable: true })
    VerificationStatus?: string;

    @Field({ nullable: true })
    AvailabilityStatus?: string;

    @Field({ nullable: true })
    Bio: string | null;

    @Field(() => Int, { nullable: true })
    YearsExperience?: number;

    @Field({ nullable: true })
    Languages?: string | null;

    @Field(() => Float, { nullable: true })
    HourlyRateMin: number | null;

    @Field(() => Float, { nullable: true })
    HourlyRateMax: number | null;

    @Field(() => Boolean, { nullable: true })
    AcceptsProBono?: boolean;

    @Field(() => Boolean, { nullable: true })
    AcceptsContingency?: boolean;

    @Field(() => Int, { nullable: true })
    ActiveReferralCount?: number;

    @Field(() => Int, { nullable: true })
    MaxConcurrentReferrals?: number;

    @Field(() => Float, { nullable: true })
    AverageResponseHours: number | null;

    @Field(() => Float, { nullable: true })
    AverageRating: number | null;

    @Field(() => Int, { nullable: true })
    TotalAcceptedCount?: number;

    @Field(() => Int, { nullable: true })
    TotalCompletedCount?: number;

    @Field(() => Boolean, { nullable: true })
    IsActive?: boolean;

    @Field(() => RestoreContextInput, { nullable: true })
    RestoreContext___?: RestoreContextInput;
}
    

//****************************************************************************
// INPUT TYPE for MJ_BizApps_Referrals: Professional Profiles
//****************************************************************************
@InputType()
export class UpdatemjBizAppsReferralsProfessionalProfileInput {
    @Field()
    ID: string;

    @Field({ nullable: true })
    PersonID?: string | null;

    @Field({ nullable: true })
    OrganizationID?: string | null;

    @Field({ nullable: true })
    UserID?: string | null;

    @Field({ nullable: true })
    DisplayName?: string;

    @Field({ nullable: true })
    FirmName?: string | null;

    @Field({ nullable: true })
    Email?: string;

    @Field({ nullable: true })
    Phone?: string | null;

    @Field({ nullable: true })
    BarOrLicenseNumber?: string | null;

    @Field({ nullable: true })
    VerificationStatus?: string;

    @Field({ nullable: true })
    AvailabilityStatus?: string;

    @Field({ nullable: true })
    Bio?: string | null;

    @Field(() => Int, { nullable: true })
    YearsExperience?: number;

    @Field({ nullable: true })
    Languages?: string | null;

    @Field(() => Float, { nullable: true })
    HourlyRateMin?: number | null;

    @Field(() => Float, { nullable: true })
    HourlyRateMax?: number | null;

    @Field(() => Boolean, { nullable: true })
    AcceptsProBono?: boolean;

    @Field(() => Boolean, { nullable: true })
    AcceptsContingency?: boolean;

    @Field(() => Int, { nullable: true })
    ActiveReferralCount?: number;

    @Field(() => Int, { nullable: true })
    MaxConcurrentReferrals?: number;

    @Field(() => Float, { nullable: true })
    AverageResponseHours?: number | null;

    @Field(() => Float, { nullable: true })
    AverageRating?: number | null;

    @Field(() => Int, { nullable: true })
    TotalAcceptedCount?: number;

    @Field(() => Int, { nullable: true })
    TotalCompletedCount?: number;

    @Field(() => Boolean, { nullable: true })
    IsActive?: boolean;

    @Field(() => [KeyValuePairInput], { nullable: true })
    OldValues___?: KeyValuePairInput[];

    @Field(() => RestoreContextInput, { nullable: true })
    RestoreContext___?: RestoreContextInput;
}
    
//****************************************************************************
// RESOLVER for MJ_BizApps_Referrals: Professional Profiles
//****************************************************************************
@ObjectType()
export class RunmjBizAppsReferralsProfessionalProfileViewResult {
    @Field(() => [mjBizAppsReferralsProfessionalProfile_])
    Results: mjBizAppsReferralsProfessionalProfile_[];

    @Field(() => String, {nullable: true})
    UserViewRunID?: string;

    @Field(() => Int, {nullable: true})
    RowCount: number;

    @Field(() => Int, {nullable: true})
    TotalRowCount: number;

    @Field(() => Int, {nullable: true})
    ExecutionTime: number;

    @Field({nullable: true})
    ErrorMessage?: string;

    @Field(() => Boolean, {nullable: false})
    Success: boolean;
}

@Resolver(mjBizAppsReferralsProfessionalProfile_)
export class mjBizAppsReferralsProfessionalProfileResolver extends ResolverBase {
    @Query(() => RunmjBizAppsReferralsProfessionalProfileViewResult)
    async RunmjBizAppsReferralsProfessionalProfileViewByID(@Arg('input', () => RunViewByIDInput) input: RunViewByIDInput, @Ctx() { providers, userPayload }: AppContext, @PubSub() pubSub: PubSubEngine) {
        const provider = GetReadOnlyProvider(providers, { allowFallbackToReadWrite: true });
        return super.RunViewByIDGeneric(input, provider, userPayload, pubSub);
    }

    @Query(() => RunmjBizAppsReferralsProfessionalProfileViewResult)
    async RunmjBizAppsReferralsProfessionalProfileViewByName(@Arg('input', () => RunViewByNameInput) input: RunViewByNameInput, @Ctx() { providers, userPayload }: AppContext, @PubSub() pubSub: PubSubEngine) {
        const provider = GetReadOnlyProvider(providers, { allowFallbackToReadWrite: true });
        return super.RunViewByNameGeneric(input, provider, userPayload, pubSub);
    }

    @Query(() => RunmjBizAppsReferralsProfessionalProfileViewResult)
    async RunmjBizAppsReferralsProfessionalProfileDynamicView(@Arg('input', () => RunDynamicViewInput) input: RunDynamicViewInput, @Ctx() { providers, userPayload }: AppContext, @PubSub() pubSub: PubSubEngine) {
        const provider = GetReadOnlyProvider(providers, { allowFallbackToReadWrite: true });
        input.EntityName = 'MJ_BizApps_Referrals: Professional Profiles';
        return super.RunDynamicViewGeneric(input, provider, userPayload, pubSub);
    }
    @Query(() => mjBizAppsReferralsProfessionalProfile_, { nullable: true })
    async mjBizAppsReferralsProfessionalProfile(@Arg('ID', () => String) ID: string, @Ctx() { userPayload, providers }: AppContext, @PubSub() pubSub: PubSubEngine): Promise<mjBizAppsReferralsProfessionalProfile_ | null> {
        this.CheckUserReadPermissions('MJ_BizApps_Referrals: Professional Profiles', userPayload);
        const provider = GetReadOnlyProvider(providers, { allowFallbackToReadWrite: true });
        const sSQL = `SELECT * FROM ${provider.QuoteSchemaAndView('__mj_BizAppsReferrals', 'vwProfessionalProfiles')} WHERE ${provider.QuoteIdentifier('ID')}=${provider.BuildParameterPlaceholder(0)} ` + this.getRowLevelSecurityWhereClause(provider, 'MJ_BizApps_Referrals: Professional Profiles', userPayload, EntityPermissionType.Read, 'AND');
        const rows = await provider.ExecuteSQL(sSQL, [ID], undefined, this.GetUserFromPayload(userPayload));
        const result = await this.MapFieldNamesToCodeNames('MJ_BizApps_Referrals: Professional Profiles', rows && rows.length > 0 ? rows[0] : null, this.GetUserFromPayload(userPayload));
        return result;
    }
    
    @Mutation(() => mjBizAppsReferralsProfessionalProfile_)
    async CreatemjBizAppsReferralsProfessionalProfile(
        @Arg('input', () => CreatemjBizAppsReferralsProfessionalProfileInput) input: CreatemjBizAppsReferralsProfessionalProfileInput,
        @Ctx() { providers, userPayload }: AppContext,
        @PubSub() pubSub: PubSubEngine
    ) {
        const provider = GetReadWriteProvider(providers);
        return this.CreateRecord('MJ_BizApps_Referrals: Professional Profiles', input, provider, userPayload, pubSub)
    }
        
    @Mutation(() => mjBizAppsReferralsProfessionalProfile_)
    async UpdatemjBizAppsReferralsProfessionalProfile(
        @Arg('input', () => UpdatemjBizAppsReferralsProfessionalProfileInput) input: UpdatemjBizAppsReferralsProfessionalProfileInput,
        @Ctx() { providers, userPayload }: AppContext,
        @PubSub() pubSub: PubSubEngine
    ) {
        const provider = GetReadWriteProvider(providers);
        return this.UpdateRecord('MJ_BizApps_Referrals: Professional Profiles', input, provider, userPayload, pubSub);
    }
    
    @Mutation(() => mjBizAppsReferralsProfessionalProfile_)
    async DeletemjBizAppsReferralsProfessionalProfile(@Arg('ID', () => String) ID: string, @Arg('options___', () => DeleteOptionsInput) options: DeleteOptionsInput, @Ctx() { providers, userPayload }: AppContext, @PubSub() pubSub: PubSubEngine) {
        const provider = GetReadWriteProvider(providers);
        const key = new CompositeKey([{FieldName: 'ID', Value: ID}]);
        return this.DeleteRecord('MJ_BizApps_Referrals: Professional Profiles', key, options, provider, userPayload, pubSub);
    }
    
}

//****************************************************************************
// ENTITY CLASS for MJ_BizApps_Referrals: Referral Assignments
//****************************************************************************
@ObjectType({ description: "Sequential cascade assignment offering a referral request to a matched professional." })
export class mjBizAppsReferralsReferralAssignment_ {
    @Field() 
    @MaxLength(36)
    ID: string;
        
    @Field({nullable: true}) 
    @MaxLength(36)
    ReferralRequestID?: string;
        
    @Field({nullable: true}) 
    @MaxLength(36)
    ProfessionalProfileID?: string;
        
    @Field(() => Int, {nullable: true}) 
    CascadeOrder?: number;
        
    @Field(() => Float, {nullable: true}) 
    MatchScore?: number;
        
    @Field({nullable: true}) 
    ScoreBreakdownJSON?: string;
        
    @Field({nullable: true}) 
    @MaxLength(30)
    ConflictStatus?: string;
        
    @Field({nullable: true}) 
    ConflictReason?: string;
        
    @Field({nullable: true}) 
    @MaxLength(30)
    Status?: string;
        
    @Field({nullable: true}) 
    OfferedAt?: Date;
        
    @Field({nullable: true}) 
    SLADeadlineAt?: Date;
        
    @Field({nullable: true}) 
    RespondedAt?: Date;
        
    @Field({nullable: true}) 
    ResponseNotes?: string;
        
    @Field({nullable: true}) 
    @MaxLength(255)
    DeclineReason?: string;
        
    @Field() 
    _mj__CreatedAt: Date;
        
    @Field() 
    _mj__UpdatedAt: Date;
        
    @Field(() => [String], { nullable: true, description: `Field-level security: when non-null, the fields on this entity the calling user may read. Any other field arriving as null was withheld by the server rather than genuinely empty. Null for callers with no field restrictions.` })
    ReadableFields___?: string[];
        
}

//****************************************************************************
// INPUT TYPE for MJ_BizApps_Referrals: Referral Assignments
//****************************************************************************
@InputType()
export class CreatemjBizAppsReferralsReferralAssignmentInput {
    @Field({ nullable: true })
    ID?: string;

    @Field({ nullable: true })
    ReferralRequestID?: string;

    @Field({ nullable: true })
    ProfessionalProfileID?: string;

    @Field(() => Int, { nullable: true })
    CascadeOrder?: number;

    @Field(() => Float, { nullable: true })
    MatchScore?: number;

    @Field({ nullable: true })
    ScoreBreakdownJSON: string | null;

    @Field({ nullable: true })
    ConflictStatus?: string;

    @Field({ nullable: true })
    ConflictReason: string | null;

    @Field({ nullable: true })
    Status?: string;

    @Field({ nullable: true })
    OfferedAt: Date | null;

    @Field({ nullable: true })
    SLADeadlineAt: Date | null;

    @Field({ nullable: true })
    RespondedAt: Date | null;

    @Field({ nullable: true })
    ResponseNotes: string | null;

    @Field({ nullable: true })
    DeclineReason: string | null;

    @Field(() => RestoreContextInput, { nullable: true })
    RestoreContext___?: RestoreContextInput;
}
    

//****************************************************************************
// INPUT TYPE for MJ_BizApps_Referrals: Referral Assignments
//****************************************************************************
@InputType()
export class UpdatemjBizAppsReferralsReferralAssignmentInput {
    @Field()
    ID: string;

    @Field({ nullable: true })
    ReferralRequestID?: string;

    @Field({ nullable: true })
    ProfessionalProfileID?: string;

    @Field(() => Int, { nullable: true })
    CascadeOrder?: number;

    @Field(() => Float, { nullable: true })
    MatchScore?: number;

    @Field({ nullable: true })
    ScoreBreakdownJSON?: string | null;

    @Field({ nullable: true })
    ConflictStatus?: string;

    @Field({ nullable: true })
    ConflictReason?: string | null;

    @Field({ nullable: true })
    Status?: string;

    @Field({ nullable: true })
    OfferedAt?: Date | null;

    @Field({ nullable: true })
    SLADeadlineAt?: Date | null;

    @Field({ nullable: true })
    RespondedAt?: Date | null;

    @Field({ nullable: true })
    ResponseNotes?: string | null;

    @Field({ nullable: true })
    DeclineReason?: string | null;

    @Field(() => [KeyValuePairInput], { nullable: true })
    OldValues___?: KeyValuePairInput[];

    @Field(() => RestoreContextInput, { nullable: true })
    RestoreContext___?: RestoreContextInput;
}
    
//****************************************************************************
// RESOLVER for MJ_BizApps_Referrals: Referral Assignments
//****************************************************************************
@ObjectType()
export class RunmjBizAppsReferralsReferralAssignmentViewResult {
    @Field(() => [mjBizAppsReferralsReferralAssignment_])
    Results: mjBizAppsReferralsReferralAssignment_[];

    @Field(() => String, {nullable: true})
    UserViewRunID?: string;

    @Field(() => Int, {nullable: true})
    RowCount: number;

    @Field(() => Int, {nullable: true})
    TotalRowCount: number;

    @Field(() => Int, {nullable: true})
    ExecutionTime: number;

    @Field({nullable: true})
    ErrorMessage?: string;

    @Field(() => Boolean, {nullable: false})
    Success: boolean;
}

@Resolver(mjBizAppsReferralsReferralAssignment_)
export class mjBizAppsReferralsReferralAssignmentResolver extends ResolverBase {
    @Query(() => RunmjBizAppsReferralsReferralAssignmentViewResult)
    async RunmjBizAppsReferralsReferralAssignmentViewByID(@Arg('input', () => RunViewByIDInput) input: RunViewByIDInput, @Ctx() { providers, userPayload }: AppContext, @PubSub() pubSub: PubSubEngine) {
        const provider = GetReadOnlyProvider(providers, { allowFallbackToReadWrite: true });
        return super.RunViewByIDGeneric(input, provider, userPayload, pubSub);
    }

    @Query(() => RunmjBizAppsReferralsReferralAssignmentViewResult)
    async RunmjBizAppsReferralsReferralAssignmentViewByName(@Arg('input', () => RunViewByNameInput) input: RunViewByNameInput, @Ctx() { providers, userPayload }: AppContext, @PubSub() pubSub: PubSubEngine) {
        const provider = GetReadOnlyProvider(providers, { allowFallbackToReadWrite: true });
        return super.RunViewByNameGeneric(input, provider, userPayload, pubSub);
    }

    @Query(() => RunmjBizAppsReferralsReferralAssignmentViewResult)
    async RunmjBizAppsReferralsReferralAssignmentDynamicView(@Arg('input', () => RunDynamicViewInput) input: RunDynamicViewInput, @Ctx() { providers, userPayload }: AppContext, @PubSub() pubSub: PubSubEngine) {
        const provider = GetReadOnlyProvider(providers, { allowFallbackToReadWrite: true });
        input.EntityName = 'MJ_BizApps_Referrals: Referral Assignments';
        return super.RunDynamicViewGeneric(input, provider, userPayload, pubSub);
    }
    @Query(() => mjBizAppsReferralsReferralAssignment_, { nullable: true })
    async mjBizAppsReferralsReferralAssignment(@Arg('ID', () => String) ID: string, @Ctx() { userPayload, providers }: AppContext, @PubSub() pubSub: PubSubEngine): Promise<mjBizAppsReferralsReferralAssignment_ | null> {
        this.CheckUserReadPermissions('MJ_BizApps_Referrals: Referral Assignments', userPayload);
        const provider = GetReadOnlyProvider(providers, { allowFallbackToReadWrite: true });
        const sSQL = `SELECT * FROM ${provider.QuoteSchemaAndView('__mj_BizAppsReferrals', 'vwReferralAssignments')} WHERE ${provider.QuoteIdentifier('ID')}=${provider.BuildParameterPlaceholder(0)} ` + this.getRowLevelSecurityWhereClause(provider, 'MJ_BizApps_Referrals: Referral Assignments', userPayload, EntityPermissionType.Read, 'AND');
        const rows = await provider.ExecuteSQL(sSQL, [ID], undefined, this.GetUserFromPayload(userPayload));
        const result = await this.MapFieldNamesToCodeNames('MJ_BizApps_Referrals: Referral Assignments', rows && rows.length > 0 ? rows[0] : null, this.GetUserFromPayload(userPayload));
        return result;
    }
    
    @Mutation(() => mjBizAppsReferralsReferralAssignment_)
    async CreatemjBizAppsReferralsReferralAssignment(
        @Arg('input', () => CreatemjBizAppsReferralsReferralAssignmentInput) input: CreatemjBizAppsReferralsReferralAssignmentInput,
        @Ctx() { providers, userPayload }: AppContext,
        @PubSub() pubSub: PubSubEngine
    ) {
        const provider = GetReadWriteProvider(providers);
        return this.CreateRecord('MJ_BizApps_Referrals: Referral Assignments', input, provider, userPayload, pubSub)
    }
        
    @Mutation(() => mjBizAppsReferralsReferralAssignment_)
    async UpdatemjBizAppsReferralsReferralAssignment(
        @Arg('input', () => UpdatemjBizAppsReferralsReferralAssignmentInput) input: UpdatemjBizAppsReferralsReferralAssignmentInput,
        @Ctx() { providers, userPayload }: AppContext,
        @PubSub() pubSub: PubSubEngine
    ) {
        const provider = GetReadWriteProvider(providers);
        return this.UpdateRecord('MJ_BizApps_Referrals: Referral Assignments', input, provider, userPayload, pubSub);
    }
    
    @Mutation(() => mjBizAppsReferralsReferralAssignment_)
    async DeletemjBizAppsReferralsReferralAssignment(@Arg('ID', () => String) ID: string, @Arg('options___', () => DeleteOptionsInput) options: DeleteOptionsInput, @Ctx() { providers, userPayload }: AppContext, @PubSub() pubSub: PubSubEngine) {
        const provider = GetReadWriteProvider(providers);
        const key = new CompositeKey([{FieldName: 'ID', Value: ID}]);
        return this.DeleteRecord('MJ_BizApps_Referrals: Referral Assignments', key, options, provider, userPayload, pubSub);
    }
    
}

//****************************************************************************
// ENTITY CLASS for MJ_BizApps_Referrals: Referral Feedbacks
//****************************************************************************
@ObjectType({ description: "Post-referral feedback, rating, and engagement outcome telemetry." })
export class mjBizAppsReferralsReferralFeedback_ {
    @Field() 
    @MaxLength(36)
    ID: string;
        
    @Field({nullable: true}) 
    @MaxLength(36)
    ReferralRequestID?: string;
        
    @Field({nullable: true}) 
    @MaxLength(36)
    ReferralAssignmentID?: string;
        
    @Field({nullable: true}) 
    @MaxLength(36)
    ProfessionalProfileID?: string;
        
    @Field({nullable: true}) 
    @MaxLength(20)
    SubmittedByType?: string;
        
    @Field(() => Int, {nullable: true}) 
    Rating?: number;
        
    @Field({nullable: true}) 
    @MaxLength(30)
    OutcomeStatus?: string;
        
    @Field({nullable: true}) 
    Comments?: string;
        
    @Field({nullable: true}) 
    SubmittedAt?: Date;
        
    @Field() 
    _mj__CreatedAt: Date;
        
    @Field() 
    _mj__UpdatedAt: Date;
        
    @Field(() => [String], { nullable: true, description: `Field-level security: when non-null, the fields on this entity the calling user may read. Any other field arriving as null was withheld by the server rather than genuinely empty. Null for callers with no field restrictions.` })
    ReadableFields___?: string[];
        
}

//****************************************************************************
// INPUT TYPE for MJ_BizApps_Referrals: Referral Feedbacks
//****************************************************************************
@InputType()
export class CreatemjBizAppsReferralsReferralFeedbackInput {
    @Field({ nullable: true })
    ID?: string;

    @Field({ nullable: true })
    ReferralRequestID?: string;

    @Field({ nullable: true })
    ReferralAssignmentID: string | null;

    @Field({ nullable: true })
    ProfessionalProfileID?: string;

    @Field({ nullable: true })
    SubmittedByType?: string;

    @Field(() => Int, { nullable: true })
    Rating?: number;

    @Field({ nullable: true })
    OutcomeStatus?: string;

    @Field({ nullable: true })
    Comments: string | null;

    @Field({ nullable: true })
    SubmittedAt?: Date;

    @Field(() => RestoreContextInput, { nullable: true })
    RestoreContext___?: RestoreContextInput;
}
    

//****************************************************************************
// INPUT TYPE for MJ_BizApps_Referrals: Referral Feedbacks
//****************************************************************************
@InputType()
export class UpdatemjBizAppsReferralsReferralFeedbackInput {
    @Field()
    ID: string;

    @Field({ nullable: true })
    ReferralRequestID?: string;

    @Field({ nullable: true })
    ReferralAssignmentID?: string | null;

    @Field({ nullable: true })
    ProfessionalProfileID?: string;

    @Field({ nullable: true })
    SubmittedByType?: string;

    @Field(() => Int, { nullable: true })
    Rating?: number;

    @Field({ nullable: true })
    OutcomeStatus?: string;

    @Field({ nullable: true })
    Comments?: string | null;

    @Field({ nullable: true })
    SubmittedAt?: Date;

    @Field(() => [KeyValuePairInput], { nullable: true })
    OldValues___?: KeyValuePairInput[];

    @Field(() => RestoreContextInput, { nullable: true })
    RestoreContext___?: RestoreContextInput;
}
    
//****************************************************************************
// RESOLVER for MJ_BizApps_Referrals: Referral Feedbacks
//****************************************************************************
@ObjectType()
export class RunmjBizAppsReferralsReferralFeedbackViewResult {
    @Field(() => [mjBizAppsReferralsReferralFeedback_])
    Results: mjBizAppsReferralsReferralFeedback_[];

    @Field(() => String, {nullable: true})
    UserViewRunID?: string;

    @Field(() => Int, {nullable: true})
    RowCount: number;

    @Field(() => Int, {nullable: true})
    TotalRowCount: number;

    @Field(() => Int, {nullable: true})
    ExecutionTime: number;

    @Field({nullable: true})
    ErrorMessage?: string;

    @Field(() => Boolean, {nullable: false})
    Success: boolean;
}

@Resolver(mjBizAppsReferralsReferralFeedback_)
export class mjBizAppsReferralsReferralFeedbackResolver extends ResolverBase {
    @Query(() => RunmjBizAppsReferralsReferralFeedbackViewResult)
    async RunmjBizAppsReferralsReferralFeedbackViewByID(@Arg('input', () => RunViewByIDInput) input: RunViewByIDInput, @Ctx() { providers, userPayload }: AppContext, @PubSub() pubSub: PubSubEngine) {
        const provider = GetReadOnlyProvider(providers, { allowFallbackToReadWrite: true });
        return super.RunViewByIDGeneric(input, provider, userPayload, pubSub);
    }

    @Query(() => RunmjBizAppsReferralsReferralFeedbackViewResult)
    async RunmjBizAppsReferralsReferralFeedbackViewByName(@Arg('input', () => RunViewByNameInput) input: RunViewByNameInput, @Ctx() { providers, userPayload }: AppContext, @PubSub() pubSub: PubSubEngine) {
        const provider = GetReadOnlyProvider(providers, { allowFallbackToReadWrite: true });
        return super.RunViewByNameGeneric(input, provider, userPayload, pubSub);
    }

    @Query(() => RunmjBizAppsReferralsReferralFeedbackViewResult)
    async RunmjBizAppsReferralsReferralFeedbackDynamicView(@Arg('input', () => RunDynamicViewInput) input: RunDynamicViewInput, @Ctx() { providers, userPayload }: AppContext, @PubSub() pubSub: PubSubEngine) {
        const provider = GetReadOnlyProvider(providers, { allowFallbackToReadWrite: true });
        input.EntityName = 'MJ_BizApps_Referrals: Referral Feedbacks';
        return super.RunDynamicViewGeneric(input, provider, userPayload, pubSub);
    }
    @Query(() => mjBizAppsReferralsReferralFeedback_, { nullable: true })
    async mjBizAppsReferralsReferralFeedback(@Arg('ID', () => String) ID: string, @Ctx() { userPayload, providers }: AppContext, @PubSub() pubSub: PubSubEngine): Promise<mjBizAppsReferralsReferralFeedback_ | null> {
        this.CheckUserReadPermissions('MJ_BizApps_Referrals: Referral Feedbacks', userPayload);
        const provider = GetReadOnlyProvider(providers, { allowFallbackToReadWrite: true });
        const sSQL = `SELECT * FROM ${provider.QuoteSchemaAndView('__mj_BizAppsReferrals', 'vwReferralFeedbacks')} WHERE ${provider.QuoteIdentifier('ID')}=${provider.BuildParameterPlaceholder(0)} ` + this.getRowLevelSecurityWhereClause(provider, 'MJ_BizApps_Referrals: Referral Feedbacks', userPayload, EntityPermissionType.Read, 'AND');
        const rows = await provider.ExecuteSQL(sSQL, [ID], undefined, this.GetUserFromPayload(userPayload));
        const result = await this.MapFieldNamesToCodeNames('MJ_BizApps_Referrals: Referral Feedbacks', rows && rows.length > 0 ? rows[0] : null, this.GetUserFromPayload(userPayload));
        return result;
    }
    
    @Mutation(() => mjBizAppsReferralsReferralFeedback_)
    async CreatemjBizAppsReferralsReferralFeedback(
        @Arg('input', () => CreatemjBizAppsReferralsReferralFeedbackInput) input: CreatemjBizAppsReferralsReferralFeedbackInput,
        @Ctx() { providers, userPayload }: AppContext,
        @PubSub() pubSub: PubSubEngine
    ) {
        const provider = GetReadWriteProvider(providers);
        return this.CreateRecord('MJ_BizApps_Referrals: Referral Feedbacks', input, provider, userPayload, pubSub)
    }
        
    @Mutation(() => mjBizAppsReferralsReferralFeedback_)
    async UpdatemjBizAppsReferralsReferralFeedback(
        @Arg('input', () => UpdatemjBizAppsReferralsReferralFeedbackInput) input: UpdatemjBizAppsReferralsReferralFeedbackInput,
        @Ctx() { providers, userPayload }: AppContext,
        @PubSub() pubSub: PubSubEngine
    ) {
        const provider = GetReadWriteProvider(providers);
        return this.UpdateRecord('MJ_BizApps_Referrals: Referral Feedbacks', input, provider, userPayload, pubSub);
    }
    
    @Mutation(() => mjBizAppsReferralsReferralFeedback_)
    async DeletemjBizAppsReferralsReferralFeedback(@Arg('ID', () => String) ID: string, @Arg('options___', () => DeleteOptionsInput) options: DeleteOptionsInput, @Ctx() { providers, userPayload }: AppContext, @PubSub() pubSub: PubSubEngine) {
        const provider = GetReadWriteProvider(providers);
        const key = new CompositeKey([{FieldName: 'ID', Value: ID}]);
        return this.DeleteRecord('MJ_BizApps_Referrals: Referral Feedbacks', key, options, provider, userPayload, pubSub);
    }
    
}

//****************************************************************************
// ENTITY CLASS for MJ_BizApps_Referrals: Referral Requests
//****************************************************************************
@ObjectType({ description: "Seeker referral intake request capturing matter details and routing state." })
export class mjBizAppsReferralsReferralRequest_ {
    @Field() 
    @MaxLength(36)
    ID: string;
        
    @Field({nullable: true}) 
    @MaxLength(50)
    RequestNumber?: string;
        
    @Field({nullable: true}) 
    @MaxLength(200)
    SeekerName?: string;
        
    @Field({nullable: true}) 
    @MaxLength(255)
    SeekerEmail?: string;
        
    @Field({nullable: true}) 
    @MaxLength(50)
    SeekerPhone?: string;
        
    @Field({nullable: true}) 
    @MaxLength(200)
    SeekerCompany?: string;
        
    @Field({nullable: true}) 
    @MaxLength(36)
    SeekerPersonID?: string;
        
    @Field({nullable: true}) 
    @MaxLength(36)
    PracticeAreaID?: string;
        
    @Field({nullable: true}) 
    @MaxLength(36)
    JurisdictionID?: string;
        
    @Field({nullable: true}) 
    @MaxLength(36)
    ReferralTierID?: string;
        
    @Field({nullable: true}) 
    @MaxLength(255)
    MatterTitle?: string;
        
    @Field({nullable: true}) 
    MatterSummary?: string;
        
    @Field({nullable: true}) 
    @MaxLength(20)
    UrgencyLevel?: string;
        
    @Field({nullable: true}) 
    @MaxLength(100)
    BudgetRange?: string;
        
    @Field({nullable: true}) 
    @MaxLength(100)
    PreferredLanguage?: string;
        
    @Field(() => Boolean, {nullable: true}) 
    RequiresProBono?: boolean;
        
    @Field({nullable: true}) 
    @MaxLength(30)
    Status?: string;
        
    @Field({nullable: true}) 
    @MaxLength(36)
    AssignedProfessionalID?: string;
        
    @Field(() => Int, {nullable: true}) 
    CurrentCascadeStep?: number;
        
    @Field({nullable: true}) 
    SubmittedAt?: Date;
        
    @Field({nullable: true}) 
    AcceptedAt?: Date;
        
    @Field({nullable: true}) 
    CompletedAt?: Date;
        
    @Field() 
    _mj__CreatedAt: Date;
        
    @Field() 
    _mj__UpdatedAt: Date;
        
    @Field({nullable: true}) 
    @MaxLength(250)
    SeekerPerson?: string;
        
    @Field({nullable: true}) 
    @MaxLength(150)
    PracticeArea?: string;
        
    @Field({nullable: true}) 
    @MaxLength(150)
    Jurisdiction?: string;
        
    @Field({nullable: true}) 
    @MaxLength(100)
    ReferralTier?: string;
        
    @Field(() => [String], { nullable: true, description: `Field-level security: when non-null, the fields on this entity the calling user may read. Any other field arriving as null was withheld by the server rather than genuinely empty. Null for callers with no field restrictions.` })
    ReadableFields___?: string[];
        
}

//****************************************************************************
// INPUT TYPE for MJ_BizApps_Referrals: Referral Requests
//****************************************************************************
@InputType()
export class CreatemjBizAppsReferralsReferralRequestInput {
    @Field({ nullable: true })
    ID?: string;

    @Field({ nullable: true })
    RequestNumber?: string;

    @Field({ nullable: true })
    SeekerName?: string;

    @Field({ nullable: true })
    SeekerEmail?: string;

    @Field({ nullable: true })
    SeekerPhone: string | null;

    @Field({ nullable: true })
    SeekerCompany: string | null;

    @Field({ nullable: true })
    SeekerPersonID: string | null;

    @Field({ nullable: true })
    PracticeAreaID?: string;

    @Field({ nullable: true })
    JurisdictionID?: string;

    @Field({ nullable: true })
    ReferralTierID?: string;

    @Field({ nullable: true })
    MatterTitle?: string;

    @Field({ nullable: true })
    MatterSummary?: string;

    @Field({ nullable: true })
    UrgencyLevel?: string;

    @Field({ nullable: true })
    BudgetRange: string | null;

    @Field({ nullable: true })
    PreferredLanguage?: string | null;

    @Field(() => Boolean, { nullable: true })
    RequiresProBono?: boolean;

    @Field({ nullable: true })
    Status?: string;

    @Field({ nullable: true })
    AssignedProfessionalID: string | null;

    @Field(() => Int, { nullable: true })
    CurrentCascadeStep?: number;

    @Field({ nullable: true })
    SubmittedAt: Date | null;

    @Field({ nullable: true })
    AcceptedAt: Date | null;

    @Field({ nullable: true })
    CompletedAt: Date | null;

    @Field(() => RestoreContextInput, { nullable: true })
    RestoreContext___?: RestoreContextInput;
}
    

//****************************************************************************
// INPUT TYPE for MJ_BizApps_Referrals: Referral Requests
//****************************************************************************
@InputType()
export class UpdatemjBizAppsReferralsReferralRequestInput {
    @Field()
    ID: string;

    @Field({ nullable: true })
    RequestNumber?: string;

    @Field({ nullable: true })
    SeekerName?: string;

    @Field({ nullable: true })
    SeekerEmail?: string;

    @Field({ nullable: true })
    SeekerPhone?: string | null;

    @Field({ nullable: true })
    SeekerCompany?: string | null;

    @Field({ nullable: true })
    SeekerPersonID?: string | null;

    @Field({ nullable: true })
    PracticeAreaID?: string;

    @Field({ nullable: true })
    JurisdictionID?: string;

    @Field({ nullable: true })
    ReferralTierID?: string;

    @Field({ nullable: true })
    MatterTitle?: string;

    @Field({ nullable: true })
    MatterSummary?: string;

    @Field({ nullable: true })
    UrgencyLevel?: string;

    @Field({ nullable: true })
    BudgetRange?: string | null;

    @Field({ nullable: true })
    PreferredLanguage?: string | null;

    @Field(() => Boolean, { nullable: true })
    RequiresProBono?: boolean;

    @Field({ nullable: true })
    Status?: string;

    @Field({ nullable: true })
    AssignedProfessionalID?: string | null;

    @Field(() => Int, { nullable: true })
    CurrentCascadeStep?: number;

    @Field({ nullable: true })
    SubmittedAt?: Date | null;

    @Field({ nullable: true })
    AcceptedAt?: Date | null;

    @Field({ nullable: true })
    CompletedAt?: Date | null;

    @Field(() => [KeyValuePairInput], { nullable: true })
    OldValues___?: KeyValuePairInput[];

    @Field(() => RestoreContextInput, { nullable: true })
    RestoreContext___?: RestoreContextInput;
}
    
//****************************************************************************
// RESOLVER for MJ_BizApps_Referrals: Referral Requests
//****************************************************************************
@ObjectType()
export class RunmjBizAppsReferralsReferralRequestViewResult {
    @Field(() => [mjBizAppsReferralsReferralRequest_])
    Results: mjBizAppsReferralsReferralRequest_[];

    @Field(() => String, {nullable: true})
    UserViewRunID?: string;

    @Field(() => Int, {nullable: true})
    RowCount: number;

    @Field(() => Int, {nullable: true})
    TotalRowCount: number;

    @Field(() => Int, {nullable: true})
    ExecutionTime: number;

    @Field({nullable: true})
    ErrorMessage?: string;

    @Field(() => Boolean, {nullable: false})
    Success: boolean;
}

@Resolver(mjBizAppsReferralsReferralRequest_)
export class mjBizAppsReferralsReferralRequestResolver extends ResolverBase {
    @Query(() => RunmjBizAppsReferralsReferralRequestViewResult)
    async RunmjBizAppsReferralsReferralRequestViewByID(@Arg('input', () => RunViewByIDInput) input: RunViewByIDInput, @Ctx() { providers, userPayload }: AppContext, @PubSub() pubSub: PubSubEngine) {
        const provider = GetReadOnlyProvider(providers, { allowFallbackToReadWrite: true });
        return super.RunViewByIDGeneric(input, provider, userPayload, pubSub);
    }

    @Query(() => RunmjBizAppsReferralsReferralRequestViewResult)
    async RunmjBizAppsReferralsReferralRequestViewByName(@Arg('input', () => RunViewByNameInput) input: RunViewByNameInput, @Ctx() { providers, userPayload }: AppContext, @PubSub() pubSub: PubSubEngine) {
        const provider = GetReadOnlyProvider(providers, { allowFallbackToReadWrite: true });
        return super.RunViewByNameGeneric(input, provider, userPayload, pubSub);
    }

    @Query(() => RunmjBizAppsReferralsReferralRequestViewResult)
    async RunmjBizAppsReferralsReferralRequestDynamicView(@Arg('input', () => RunDynamicViewInput) input: RunDynamicViewInput, @Ctx() { providers, userPayload }: AppContext, @PubSub() pubSub: PubSubEngine) {
        const provider = GetReadOnlyProvider(providers, { allowFallbackToReadWrite: true });
        input.EntityName = 'MJ_BizApps_Referrals: Referral Requests';
        return super.RunDynamicViewGeneric(input, provider, userPayload, pubSub);
    }
    @Query(() => mjBizAppsReferralsReferralRequest_, { nullable: true })
    async mjBizAppsReferralsReferralRequest(@Arg('ID', () => String) ID: string, @Ctx() { userPayload, providers }: AppContext, @PubSub() pubSub: PubSubEngine): Promise<mjBizAppsReferralsReferralRequest_ | null> {
        this.CheckUserReadPermissions('MJ_BizApps_Referrals: Referral Requests', userPayload);
        const provider = GetReadOnlyProvider(providers, { allowFallbackToReadWrite: true });
        const sSQL = `SELECT * FROM ${provider.QuoteSchemaAndView('__mj_BizAppsReferrals', 'vwReferralRequests')} WHERE ${provider.QuoteIdentifier('ID')}=${provider.BuildParameterPlaceholder(0)} ` + this.getRowLevelSecurityWhereClause(provider, 'MJ_BizApps_Referrals: Referral Requests', userPayload, EntityPermissionType.Read, 'AND');
        const rows = await provider.ExecuteSQL(sSQL, [ID], undefined, this.GetUserFromPayload(userPayload));
        const result = await this.MapFieldNamesToCodeNames('MJ_BizApps_Referrals: Referral Requests', rows && rows.length > 0 ? rows[0] : null, this.GetUserFromPayload(userPayload));
        return result;
    }
    
    @Mutation(() => mjBizAppsReferralsReferralRequest_)
    async CreatemjBizAppsReferralsReferralRequest(
        @Arg('input', () => CreatemjBizAppsReferralsReferralRequestInput) input: CreatemjBizAppsReferralsReferralRequestInput,
        @Ctx() { providers, userPayload }: AppContext,
        @PubSub() pubSub: PubSubEngine
    ) {
        const provider = GetReadWriteProvider(providers);
        return this.CreateRecord('MJ_BizApps_Referrals: Referral Requests', input, provider, userPayload, pubSub)
    }
        
    @Mutation(() => mjBizAppsReferralsReferralRequest_)
    async UpdatemjBizAppsReferralsReferralRequest(
        @Arg('input', () => UpdatemjBizAppsReferralsReferralRequestInput) input: UpdatemjBizAppsReferralsReferralRequestInput,
        @Ctx() { providers, userPayload }: AppContext,
        @PubSub() pubSub: PubSubEngine
    ) {
        const provider = GetReadWriteProvider(providers);
        return this.UpdateRecord('MJ_BizApps_Referrals: Referral Requests', input, provider, userPayload, pubSub);
    }
    
    @Mutation(() => mjBizAppsReferralsReferralRequest_)
    async DeletemjBizAppsReferralsReferralRequest(@Arg('ID', () => String) ID: string, @Arg('options___', () => DeleteOptionsInput) options: DeleteOptionsInput, @Ctx() { providers, userPayload }: AppContext, @PubSub() pubSub: PubSubEngine) {
        const provider = GetReadWriteProvider(providers);
        const key = new CompositeKey([{FieldName: 'ID', Value: ID}]);
        return this.DeleteRecord('MJ_BizApps_Referrals: Referral Requests', key, options, provider, userPayload, pubSub);
    }
    
}

//****************************************************************************
// ENTITY CLASS for MJ_BizApps_Referrals: Referral Tiers
//****************************************************************************
@ObjectType({ description: "Service-level agreement tiers governing SLA response windows and cascade depth." })
export class mjBizAppsReferralsReferralTier_ {
    @Field() 
    @MaxLength(36)
    ID: string;
        
    @Field({nullable: true}) 
    @MaxLength(100)
    Name?: string;
        
    @Field({nullable: true}) 
    @MaxLength(50)
    Code?: string;
        
    @Field(() => Int, {nullable: true}) 
    SLAResponseHours?: number;
        
    @Field(() => Int, {nullable: true}) 
    MaxCascadeAttempts?: number;
        
    @Field(() => Float, {nullable: true}) 
    PriorityWeight?: number;
        
    @Field(() => Boolean, {nullable: true}) 
    RequireConflictCheck?: boolean;
        
    @Field({nullable: true}) 
    Description?: string;
        
    @Field(() => Boolean, {nullable: true}) 
    IsActive?: boolean;
        
    @Field() 
    _mj__CreatedAt: Date;
        
    @Field() 
    _mj__UpdatedAt: Date;
        
    @Field(() => [String], { nullable: true, description: `Field-level security: when non-null, the fields on this entity the calling user may read. Any other field arriving as null was withheld by the server rather than genuinely empty. Null for callers with no field restrictions.` })
    ReadableFields___?: string[];
        
}

//****************************************************************************
// INPUT TYPE for MJ_BizApps_Referrals: Referral Tiers
//****************************************************************************
@InputType()
export class CreatemjBizAppsReferralsReferralTierInput {
    @Field({ nullable: true })
    ID?: string;

    @Field({ nullable: true })
    Name?: string;

    @Field({ nullable: true })
    Code?: string;

    @Field(() => Int, { nullable: true })
    SLAResponseHours?: number;

    @Field(() => Int, { nullable: true })
    MaxCascadeAttempts?: number;

    @Field(() => Float, { nullable: true })
    PriorityWeight?: number;

    @Field(() => Boolean, { nullable: true })
    RequireConflictCheck?: boolean;

    @Field({ nullable: true })
    Description: string | null;

    @Field(() => Boolean, { nullable: true })
    IsActive?: boolean;

    @Field(() => RestoreContextInput, { nullable: true })
    RestoreContext___?: RestoreContextInput;
}
    

//****************************************************************************
// INPUT TYPE for MJ_BizApps_Referrals: Referral Tiers
//****************************************************************************
@InputType()
export class UpdatemjBizAppsReferralsReferralTierInput {
    @Field()
    ID: string;

    @Field({ nullable: true })
    Name?: string;

    @Field({ nullable: true })
    Code?: string;

    @Field(() => Int, { nullable: true })
    SLAResponseHours?: number;

    @Field(() => Int, { nullable: true })
    MaxCascadeAttempts?: number;

    @Field(() => Float, { nullable: true })
    PriorityWeight?: number;

    @Field(() => Boolean, { nullable: true })
    RequireConflictCheck?: boolean;

    @Field({ nullable: true })
    Description?: string | null;

    @Field(() => Boolean, { nullable: true })
    IsActive?: boolean;

    @Field(() => [KeyValuePairInput], { nullable: true })
    OldValues___?: KeyValuePairInput[];

    @Field(() => RestoreContextInput, { nullable: true })
    RestoreContext___?: RestoreContextInput;
}
    
//****************************************************************************
// RESOLVER for MJ_BizApps_Referrals: Referral Tiers
//****************************************************************************
@ObjectType()
export class RunmjBizAppsReferralsReferralTierViewResult {
    @Field(() => [mjBizAppsReferralsReferralTier_])
    Results: mjBizAppsReferralsReferralTier_[];

    @Field(() => String, {nullable: true})
    UserViewRunID?: string;

    @Field(() => Int, {nullable: true})
    RowCount: number;

    @Field(() => Int, {nullable: true})
    TotalRowCount: number;

    @Field(() => Int, {nullable: true})
    ExecutionTime: number;

    @Field({nullable: true})
    ErrorMessage?: string;

    @Field(() => Boolean, {nullable: false})
    Success: boolean;
}

@Resolver(mjBizAppsReferralsReferralTier_)
export class mjBizAppsReferralsReferralTierResolver extends ResolverBase {
    @Query(() => RunmjBizAppsReferralsReferralTierViewResult)
    async RunmjBizAppsReferralsReferralTierViewByID(@Arg('input', () => RunViewByIDInput) input: RunViewByIDInput, @Ctx() { providers, userPayload }: AppContext, @PubSub() pubSub: PubSubEngine) {
        const provider = GetReadOnlyProvider(providers, { allowFallbackToReadWrite: true });
        return super.RunViewByIDGeneric(input, provider, userPayload, pubSub);
    }

    @Query(() => RunmjBizAppsReferralsReferralTierViewResult)
    async RunmjBizAppsReferralsReferralTierViewByName(@Arg('input', () => RunViewByNameInput) input: RunViewByNameInput, @Ctx() { providers, userPayload }: AppContext, @PubSub() pubSub: PubSubEngine) {
        const provider = GetReadOnlyProvider(providers, { allowFallbackToReadWrite: true });
        return super.RunViewByNameGeneric(input, provider, userPayload, pubSub);
    }

    @Query(() => RunmjBizAppsReferralsReferralTierViewResult)
    async RunmjBizAppsReferralsReferralTierDynamicView(@Arg('input', () => RunDynamicViewInput) input: RunDynamicViewInput, @Ctx() { providers, userPayload }: AppContext, @PubSub() pubSub: PubSubEngine) {
        const provider = GetReadOnlyProvider(providers, { allowFallbackToReadWrite: true });
        input.EntityName = 'MJ_BizApps_Referrals: Referral Tiers';
        return super.RunDynamicViewGeneric(input, provider, userPayload, pubSub);
    }
    @Query(() => mjBizAppsReferralsReferralTier_, { nullable: true })
    async mjBizAppsReferralsReferralTier(@Arg('ID', () => String) ID: string, @Ctx() { userPayload, providers }: AppContext, @PubSub() pubSub: PubSubEngine): Promise<mjBizAppsReferralsReferralTier_ | null> {
        this.CheckUserReadPermissions('MJ_BizApps_Referrals: Referral Tiers', userPayload);
        const provider = GetReadOnlyProvider(providers, { allowFallbackToReadWrite: true });
        const sSQL = `SELECT * FROM ${provider.QuoteSchemaAndView('__mj_BizAppsReferrals', 'vwReferralTiers')} WHERE ${provider.QuoteIdentifier('ID')}=${provider.BuildParameterPlaceholder(0)} ` + this.getRowLevelSecurityWhereClause(provider, 'MJ_BizApps_Referrals: Referral Tiers', userPayload, EntityPermissionType.Read, 'AND');
        const rows = await provider.ExecuteSQL(sSQL, [ID], undefined, this.GetUserFromPayload(userPayload));
        const result = await this.MapFieldNamesToCodeNames('MJ_BizApps_Referrals: Referral Tiers', rows && rows.length > 0 ? rows[0] : null, this.GetUserFromPayload(userPayload));
        return result;
    }
    
    @Mutation(() => mjBizAppsReferralsReferralTier_)
    async CreatemjBizAppsReferralsReferralTier(
        @Arg('input', () => CreatemjBizAppsReferralsReferralTierInput) input: CreatemjBizAppsReferralsReferralTierInput,
        @Ctx() { providers, userPayload }: AppContext,
        @PubSub() pubSub: PubSubEngine
    ) {
        const provider = GetReadWriteProvider(providers);
        return this.CreateRecord('MJ_BizApps_Referrals: Referral Tiers', input, provider, userPayload, pubSub)
    }
        
    @Mutation(() => mjBizAppsReferralsReferralTier_)
    async UpdatemjBizAppsReferralsReferralTier(
        @Arg('input', () => UpdatemjBizAppsReferralsReferralTierInput) input: UpdatemjBizAppsReferralsReferralTierInput,
        @Ctx() { providers, userPayload }: AppContext,
        @PubSub() pubSub: PubSubEngine
    ) {
        const provider = GetReadWriteProvider(providers);
        return this.UpdateRecord('MJ_BizApps_Referrals: Referral Tiers', input, provider, userPayload, pubSub);
    }
    
    @Mutation(() => mjBizAppsReferralsReferralTier_)
    async DeletemjBizAppsReferralsReferralTier(@Arg('ID', () => String) ID: string, @Arg('options___', () => DeleteOptionsInput) options: DeleteOptionsInput, @Ctx() { providers, userPayload }: AppContext, @PubSub() pubSub: PubSubEngine) {
        const provider = GetReadWriteProvider(providers);
        const key = new CompositeKey([{FieldName: 'ID', Value: ID}]);
        return this.DeleteRecord('MJ_BizApps_Referrals: Referral Tiers', key, options, provider, userPayload, pubSub);
    }
    
}