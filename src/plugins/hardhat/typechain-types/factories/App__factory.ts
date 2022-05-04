/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { App, AppInterface } from "../App";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
    ],
    name: "NameClaimed",
    type: "event",
  },
  {
    inputs: [],
    name: "PUBLISH_GAS",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "postId",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "tag",
        type: "string",
      },
      {
        internalType: "bool",
        name: "calculateForTopTags",
        type: "bool",
      },
    ],
    name: "addTagToPost",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
    ],
    name: "claimName",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "ownerTimeline",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "ownerTimelineLength",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    name: "postTagScore",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "posts",
    outputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "content",
        type: "string",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "postsLength",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "content",
        type: "string",
      },
    ],
    name: "publishPost",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "tagTimeline",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "tagTimelineIncludes",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "topTagsOfPost",
    outputs: [
      {
        internalType: "string",
        name: "tag",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "score",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "walletToNameMap",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50611a27806100206000396000f3fe6080604052600436106100c25760003560e01c8063629066701161007f5780639c93421f116100595780639c93421f146102b6578063b92c42b0146102f4578063c0f53dab14610331578063c57194631461034d576100c2565b806362906670146102235780638838f0341461024e5780638f05c9341461028b576100c2565b80630b1e7f83146100c757806317e20061146101065780631e9392f2146101435780631f7c77811461018057806354c25e4b146101bd5780635877b1e3146101e6575b600080fd5b3480156100d357600080fd5b506100ee60048036038101906100e99190611256565b610369565b6040516100fd939291906115b8565b60405180910390f35b34801561011257600080fd5b5061012d6004803603810190610128919061115c565b61044b565b60405161013a91906114cb565b60405180910390f35b34801561014f57600080fd5b5061016a60048036038101906101659190611202565b6104eb565b604051610177919061159d565b60405180910390f35b34801561018c57600080fd5b506101a760048036038101906101a2919061115c565b610532565b6040516101b4919061159d565b60405180910390f35b3480156101c957600080fd5b506101e460048036038101906101df91906111c1565b61057e565b005b3480156101f257600080fd5b5061020d60048036038101906102089190611185565b610889565b60405161021a919061159d565b60405180910390f35b34801561022f57600080fd5b506102386108ba565b604051610245919061159d565b60405180910390f35b34801561025a57600080fd5b5061027560048036038101906102709190611202565b6108bf565b60405161028291906114b0565b60405180910390f35b34801561029757600080fd5b506102a0610904565b6040516102ad919061159d565b60405180910390f35b3480156102c257600080fd5b506102dd60048036038101906102d8919061133a565b610911565b6040516102eb9291906114ed565b60405180910390f35b34801561030057600080fd5b5061031b6004803603810190610316919061127f565b6109d0565b604051610328919061159d565b60405180910390f35b61034b600480360381019061034691906112d3565b610a0b565b005b610367600480360381019061036291906111c1565b610e24565b005b6002818154811061037957600080fd5b90600052602060002090600302016000915090508060000154908060010180546103a2906117e1565b80601f01602080910402602001604051908101604052809291908181526020018280546103ce906117e1565b801561041b5780601f106103f05761010080835404028352916020019161041b565b820191906000526020600020905b8154815290600101906020018083116103fe57829003601f168201915b5050505050908060020160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905083565b6000602052806000526040600020600091509050805461046a906117e1565b80601f0160208091040260200160405190810160405280929190818152602001828054610496906117e1565b80156104e35780601f106104b8576101008083540402835291602001916104e3565b820191906000526020600020905b8154815290600101906020018083116104c657829003601f168201915b505050505081565b600782805160208101820180518482526020830160208501208183528095505050505050818154811061051d57600080fd5b90600052602060002001600091509150505481565b6000600360008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020805490509050919050565b6040815111156105c3576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016105ba9061151d565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff166001826040516105eb9190611499565b908152602001604051809103902060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614610670576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016106679061155d565b60405180910390fd5b60008060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002080546106bb906117e1565b80601f01602080910402602001604051908101604052809291908181526020018280546106e7906117e1565b80156107345780601f1061070957610100808354040283529160200191610734565b820191906000526020600020905b81548152906001019060200180831161071757829003601f168201915b50505050509050600081511115610787576001816040516107559190611499565b908152602001604051809103902060006101000a81549073ffffffffffffffffffffffffffffffffffffffff02191690555b816000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002090805190602001906107d9929190610ff8565b50336001836040516107eb9190611499565b908152602001604051809103902060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055503373ffffffffffffffffffffffffffffffffffffffff167f9b15f899d7d0612a57fe7cbb7161c378e987fa2c3ade807d80b8c3bb1771dd2b8360405161087d91906114cb565b60405180910390a25050565b600360205281600052604060002081815481106108a557600080fd5b90600052602060002001600091509150505481565b606481565b6006828051602081018201805184825260208301602085012081835280955050505050506020528060005260406000206000915091509054906101000a900460ff1681565b6000600280549050905090565b6005602052816000526040600020816004811061092d57600080fd5b6002020160009150915050806000018054610947906117e1565b80601f0160208091040260200160405190810160405280929190818152602001828054610973906117e1565b80156109c05780601f10610995576101008083540402835291602001916109c0565b820191906000526020600020905b8154815290600101906020018083116109a357829003601f168201915b5050505050908060010154905082565b600460205281600052604060002081805160208101820180518482526020830160208501208183528095505050505050600091509150505481565b6002805490508310610a52576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610a499061153d565b60405180910390fd5b6000346004600086815260200190815260200160002084604051610a769190611499565b908152602001604051809103902054610a8f9190611673565b9050806004600086815260200190815260200160002084604051610ab39190611499565b9081526020016040518091039020819055508115610e1e57600060049050600060016004610ae19190611723565b90506000610aed61107e565b610af561107e565b5b60008410610cb957600184610b0b9190611723565b9250600560008a81526020019081526020016000208360048110610b58577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60020201604051806040016040529081600082018054610b77906117e1565b80601f0160208091040260200160405190810160405280929190818152602001828054610ba3906117e1565b8015610bf05780601f10610bc557610100808354040283529160200191610bf0565b820191906000526020600020905b815481529060010190602001808311610bd357829003601f168201915b5050505050815260200160018201548152505091508060200151861115610ca9578394508160200151861115610c9f5781600560008b81526020019081526020016000208560048110610c6c577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b600202016000820151816000019080519060200190610c8c929190610ff8565b5060208201518160010155905050610ca4565b610cb9565b610cae565b610cb9565b829350819050610af6565b6004851015610e1857604051806040016040528089815260200187815250600560008b81526020019081526020016000208660048110610d22577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b600202016000820151816000019080519060200190610d42929190610ff8565b5060208201518160010155905050600688604051610d609190611499565b908152602001604051809103902060008a815260200190815260200160002060009054906101000a900460ff16610e175788600789604051610da29190611499565b90815260200160405180910390206001816001815401808255809150500390600052602060002001819055506001600689604051610de09190611499565b908152602001604051809103902060008b815260200190815260200160002060006101000a81548160ff0219169083151502179055505b5b50505050505b50505050565b600060643a610e3391906116c9565b905080341015610e78576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610e6f9061157d565b60405180910390fd5b3373ffffffffffffffffffffffffffffffffffffffff166108fc8234610e9e9190611723565b9081150290604051600060405180830381858888f19350505050158015610ec9573d6000803e3d6000fd5b50600280549050600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600181600181540180825580915050039060005260206000200181905550604051806060016040528060028054905081526020018381526020013373ffffffffffffffffffffffffffffffffffffffff168152506002600181600181540180825580915050039060005260206000209060030201600082015181600001556020820151816001019080519060200190610fa9929190610ff8565b5060408201518160020160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055509050505050565b828054611004906117e1565b90600052602060002090601f016020900481019282611026576000855561106d565b82601f1061103f57805160ff191683800117855561106d565b8280016001018555821561106d579182015b8281111561106c578251825591602001919060010190611051565b5b50905061107a9190611098565b5090565b604051806040016040528060608152602001600081525090565b5b808211156110b1576000816000905550600101611099565b5090565b60006110c86110c38461161b565b6115f6565b9050828152602081018484840111156110e057600080fd5b6110eb84828561179f565b509392505050565b600081359050611102816119ac565b92915050565b600081359050611117816119c3565b92915050565b600082601f83011261112e57600080fd5b813561113e8482602086016110b5565b91505092915050565b600081359050611156816119da565b92915050565b60006020828403121561116e57600080fd5b600061117c848285016110f3565b91505092915050565b6000806040838503121561119857600080fd5b60006111a6858286016110f3565b92505060206111b785828601611147565b9150509250929050565b6000602082840312156111d357600080fd5b600082013567ffffffffffffffff8111156111ed57600080fd5b6111f98482850161111d565b91505092915050565b6000806040838503121561121557600080fd5b600083013567ffffffffffffffff81111561122f57600080fd5b61123b8582860161111d565b925050602061124c85828601611147565b9150509250929050565b60006020828403121561126857600080fd5b600061127684828501611147565b91505092915050565b6000806040838503121561129257600080fd5b60006112a085828601611147565b925050602083013567ffffffffffffffff8111156112bd57600080fd5b6112c98582860161111d565b9150509250929050565b6000806000606084860312156112e857600080fd5b60006112f686828701611147565b935050602084013567ffffffffffffffff81111561131357600080fd5b61131f8682870161111d565b925050604061133086828701611108565b9150509250925092565b6000806040838503121561134d57600080fd5b600061135b85828601611147565b925050602061136c85828601611147565b9150509250929050565b61137f81611757565b82525050565b61138e81611769565b82525050565b600061139f8261164c565b6113a98185611657565b93506113b98185602086016117ae565b6113c2816118d1565b840191505092915050565b60006113d88261164c565b6113e28185611668565b93506113f28185602086016117ae565b80840191505092915050565b600061140b603083611657565b9150611416826118e2565b604082019050919050565b600061142e601383611657565b915061143982611931565b602082019050919050565b6000611451601083611657565b915061145c8261195a565b602082019050919050565b6000611474601c83611657565b915061147f82611983565b602082019050919050565b61149381611795565b82525050565b60006114a582846113cd565b915081905092915050565b60006020820190506114c56000830184611385565b92915050565b600060208201905081810360008301526114e58184611394565b905092915050565b600060408201905081810360008301526115078185611394565b9050611516602083018461148a565b9392505050565b60006020820190508181036000830152611536816113fe565b9050919050565b6000602082019050818103600083015261155681611421565b9050919050565b6000602082019050818103600083015261157681611444565b9050919050565b6000602082019050818103600083015261159681611467565b9050919050565b60006020820190506115b2600083018461148a565b92915050565b60006060820190506115cd600083018661148a565b81810360208301526115df8185611394565b90506115ee6040830184611376565b949350505050565b6000611600611611565b905061160c8282611813565b919050565b6000604051905090565b600067ffffffffffffffff821115611636576116356118a2565b5b61163f826118d1565b9050602081019050919050565b600081519050919050565b600082825260208201905092915050565b600081905092915050565b600061167e82611795565b915061168983611795565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff038211156116be576116bd611844565b5b828201905092915050565b60006116d482611795565b91506116df83611795565b9250817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff048311821515161561171857611717611844565b5b828202905092915050565b600061172e82611795565b915061173983611795565b92508282101561174c5761174b611844565b5b828203905092915050565b600061176282611775565b9050919050565b60008115159050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b82818337600083830152505050565b60005b838110156117cc5780820151818401526020810190506117b1565b838111156117db576000848401525b50505050565b600060028204905060018216806117f957607f821691505b6020821081141561180d5761180c611873565b5b50919050565b61181c826118d1565b810181811067ffffffffffffffff8211171561183b5761183a6118a2565b5b80604052505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6000601f19601f8301169050919050565b7f4c656e6774682063616e2774206265206c6f6e676572207468616e203634204160008201527f5343494920636861726163746572732e00000000000000000000000000000000602082015250565b7f506f737420646f65736e27742065786973742e00000000000000000000000000600082015250565b7f416c726561647920636c61696d65642e00000000000000000000000000000000600082015250565b7f4e6f7420656e6f75676820666565207061696420746f20706f73742e00000000600082015250565b6119b581611757565b81146119c057600080fd5b50565b6119cc81611769565b81146119d757600080fd5b50565b6119e381611795565b81146119ee57600080fd5b5056fea2646970667358221220fd9f53028d7e1f7f752572e8991ecc8b5f0d385a9bfe1245cecec6ec0e2e604264736f6c63430008040033";

type AppConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: AppConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class App__factory extends ContractFactory {
  constructor(...args: AppConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<App> {
    return super.deploy(overrides || {}) as Promise<App>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): App {
    return super.attach(address) as App;
  }
  override connect(signer: Signer): App__factory {
    return super.connect(signer) as App__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): AppInterface {
    return new utils.Interface(_abi) as AppInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): App {
    return new Contract(address, _abi, signerOrProvider) as App;
  }
}
