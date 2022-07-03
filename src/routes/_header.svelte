<script lang="ts">
    import KBoxEffect from "$/lib/kicho-ui/components/effects/KBoxEffect.svelte";
    import { getTimeline, TimelineGroup } from "$/plugins/api/app";
    import { account, connectWallet } from "$/plugins/wallet";
    import AddressOf from "$lib/App/AddressOf.svelte";
    import AvatarOf from "$lib/App/AvatarOf.svelte";
    import NicknameOf from "$lib/App/NicknameOf.svelte";
    import Post from "$lib/App/Post.svelte";
    import Timeline from "$lib/App/Timeline.svelte";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import KHoverMenu from "$lib/kicho-ui/components/KHoverMenu.svelte";
    import { get } from "svelte/store";
    import { currentRoute } from "./_routing.svelte";

    let height: number = 0;

    const metionsTimelinePromise = getTimeline({ timelineId: { group: TimelineGroup.ProfileMentions, id: $account } });
</script>

<header style:--height={height} bind:clientHeight={height}>
    <KBoxEffect color="mode" blur size="smaller" background radius="tile">
        {#if $account}
            <div class="account-info">
                <div class="avatar">
                    <AvatarOf address={$account} />
                </div>
                <div class="nickname"><NicknameOf address={$account} /></div>
                <div class="address">
                    <KButton text href="#{$currentRoute.path}#claim-name" title="Claim name for: {$account}">
                        <div>
                            <AddressOf address={$account} />
                        </div>
                    </KButton>
                </div>
            </div>
        {:else}
            <KButton color="gradient" glow="gradient" glowMultiplier={0.5} on:click={() => connectWallet()}>Connect Wallet</KButton>
        {/if}
        {#if $account}
            <KButton color="slave" radius="fab">
                {#await metionsTimelinePromise}
                    N...
                {:then timeline}
                    N: {get(timeline.length)}
                    <KHoverMenu background direction="left">
                        <b>Notifications</b>
                        <Timeline {timeline} let:postIds>
                            {#each postIds as postId (postId.toString())}
                                <a href="#{$currentRoute.path}#{postId}">
                                    <Post {postId} />
                                </a>
                            {/each}
                        </Timeline>
                    </KHoverMenu>
                {/await}
            </KButton>
        {/if}
        <KButton radius="fab" color={$currentRoute.path || $currentRoute.hash ? "mode-pop" : "master"} href="#">Home</KButton>
        <!-- <div class="account-balance k-text-singleline">Balance: <b><Balance /></b></div> -->
    </KBoxEffect>
</header>

<style>
    header {
        display: grid;
        grid-template-columns: 1fr auto auto;
        align-items: center;
        justify-content: space-between;
        justify-items: start;
        padding: calc(var(--k-padding) * 2);
        gap: calc(var(--k-padding) * 2);

        /* scroll-padding-top: var(--height); */
    }

    .account-info {
        display: grid;
        align-items: center;
        grid-template-columns: 2.5em 1fr;
        grid-template-areas:
            "avatar nickname"
            "avatar address";
        gap: calc(var(--k-padding) * 1);
    }

    .avatar {
        grid-area: avatar;
    }

    .nickname {
        grid-area: nickname;
    }

    .address {
        grid-area: address;
        max-width: 12em;
    }
</style>
